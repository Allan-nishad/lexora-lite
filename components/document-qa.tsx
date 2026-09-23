"use client";

import React, { useState } from "react";
import { AskQuestionResponse } from "@/types/analysis";
import {
  MessageSquare,
  Send,
  Sparkles,
  Quote,
  CheckCircle2,
  AlertTriangle,
  Bot,
  User,
  Trash2,
  Copy,
  Check,
  FileCheck2,
} from "lucide-react";

interface DocumentQAProps {
  documentText: string;
}

interface QAHistoryItem {
  id: string;
  question: string;
  response: AskQuestionResponse;
  timestamp: Date;
}

const EXAMPLE_QUESTIONS = [
  "What is the payment deadline?",
  "What notice period is mentioned?",
  "What are the client's responsibilities?",
  "Is a termination condition specified?",
  "What information is missing from this document?",
  "What is the client's registered company number?",
];

export function DocumentQA({ documentText }: DocumentQAProps) {
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<QAHistoryItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleAsk = async (queryText?: string) => {
    const q = (queryText || question).trim();
    if (!q || !documentText.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentText,
          question: q,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to answer question. Please try again.");
      }

      const newItem: QAHistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        question: q,
        response: data.data,
        timestamp: new Date(),
      };

      setHistory((prev) => [newItem, ...prev]);
      setQuestion("");
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyAnswer = (item: QAHistoryItem) => {
    const text = `Q: ${item.question}\nA: ${item.response.answer}${
      item.response.evidence ? `\nEvidence: "${item.response.evidence}"` : ""
    }`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <section
      aria-label="Document Question Answering"
      className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-7 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-xs">
            <MessageSquare className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              Ask The Document
            </h3>
            <p className="text-xs text-slate-500">
              Zero hallucination Q&A grounded strictly in your document text.
            </p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={() => setHistory([])}
            aria-label="Clear question history"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Suggested Question Chips */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-blue-600" aria-hidden="true" />
          Suggested Instant Inquiries:
        </span>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Suggested Inquiries">
          {EXAMPLE_QUESTIONS.map((example, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuestion(example);
                handleAsk(example);
              }}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 rounded-xl transition-all text-left disabled:opacity-50 cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Sparkles className="w-3 h-3 text-blue-500 flex-shrink-0" aria-hidden="true" />
              <span className="font-medium">{example}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Type your document question"
            placeholder="Ask anything about this document (e.g., What happens if I terminate early?)..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 text-sm bg-slate-50/60 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 transition-all placeholder:text-slate-400 font-medium"
          />
          <button
            type="button"
            onClick={() => handleAsk()}
            disabled={isLoading || !question.trim()}
            aria-label="Submit question to document AI"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:from-blue-800 text-white font-bold text-sm rounded-xl shadow-xs transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
            ) : (
              <>
                <Send className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">Ask AI</span>
              </>
            )}
          </button>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* QA Conversation List */}
      {history.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-100" aria-live="polite">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Inquiry History ({history.length})</span>
          </div>

          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="bg-slate-50/70 rounded-2xl border border-slate-200/90 p-5 space-y-4 shadow-2xs hover:shadow-xs transition-all"
              >
                {/* User Question Bubble */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-2xs">
                    <User className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      User Question
                    </span>
                    <div className="font-extrabold text-slate-900 text-sm sm:text-base">
                      {item.question}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => copyAnswer(item)}
                    aria-label="Copy question and answer"
                    className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                    ) : (
                      <Copy className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>

                {/* AI Answer Card */}
                <div className="pl-0 sm:pl-11 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3 h-3" aria-hidden="true" />
                    </div>
                    {item.response.foundInDocument ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                        Grounded in Document
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                        Not Specified in Document Text
                      </span>
                    )}

                    {item.response.isVerified && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        <FileCheck2 className="w-3 h-3 text-blue-600" aria-hidden="true" />
                        Verified Quote
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-slate-800 leading-relaxed bg-white p-4 rounded-xl border border-slate-200 shadow-2xs font-medium">
                    {item.response.answer}
                  </div>

                  {/* Evidence Quote if present */}
                  {item.response.evidence &&
                    item.response.evidence.trim() !== "" && (
                      <div className="p-3.5 bg-gradient-to-r from-indigo-50/70 to-blue-50/50 border-l-4 border-indigo-500 rounded-r-xl space-y-1 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-indigo-950 uppercase tracking-wider">
                            <Quote className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
                            Direct Supporting Document Quote:
                          </div>
                          <span className="text-[10px] font-semibold text-slate-500">
                            Based on supplied document
                          </span>
                        </div>
                        <p className="text-xs text-slate-900 font-mono leading-relaxed">
                          &ldquo;{item.response.evidence}&rdquo;
                        </p>
                      </div>
                    )}

                  {item.response.limitations && (
                    <p className="text-[11px] text-slate-400 italic">
                      {item.response.limitations}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
