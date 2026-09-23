"use client";

import React, { useState } from "react";
import { Header } from "@/components/header";
import { SafetyNotice } from "@/components/safety-notice";
import { DocumentInput } from "@/components/document-input";
import { AnalysisResults } from "@/components/analysis-results";
import { DocumentQA } from "@/components/document-qa";
import { Footer } from "@/components/footer";
import { AnalysisResult } from "@/types/analysis";
import {
  Sparkles,
  FileSearch,
  RotateCcw,
  Quote,
  ShieldCheck,
  Clock,
  Layers,
} from "lucide-react";

export default function Home() {
  const [documentText, setDocumentText] = useState("");
  const [documentTitle, setDocumentTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analyzedDocText, setAnalyzedDocText] = useState<string>("");

  const handleAnalyze = async () => {
    const text = documentText.trim();
    if (!text) {
      setErrorMessage("Please paste or upload legal document text to analyze.");
      return;
    }
    if (text.length < 10) {
      setErrorMessage("Document text is too short. Please provide at least 10 characters.");
      return;
    }
    if (text.length > 100000) {
      setErrorMessage("Document text exceeds the 100,000 character limit.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentText: text,
          documentTitle: documentTitle.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Failed to analyze document. Please check your configuration."
        );
      }

      setAnalysisResult(data.data);
      setAnalyzedDocText(text);

      // Smooth scroll to results
      setTimeout(() => {
        const resultsEl = document.getElementById("results-section");
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || "An unexpected error occurred during analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setDocumentText("");
    setDocumentTitle("");
    setAnalysisResult(null);
    setAnalyzedDocText("");
    setErrorMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-slate-50/70 to-slate-100/50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
        {/* 1. Hero & Value Proposition */}
        <section className="space-y-6">
          <div className="text-center max-w-3xl mx-auto space-y-4 pt-2 sm:pt-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/90 rounded-full text-blue-800 text-xs font-extrabold tracking-wide uppercase shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>PromptWars AI Challenge &bull; Legal Assistance & Access</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Understand Legal Contracts{" "}
              <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 bg-clip-text text-transparent">
                Before You Sign
              </span>
            </h1>

            <p className="text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-medium">
              Transform confusing legalese into plain-language clause explanations, party obligations, and verified verbatim quotes backed by Google Gemini.
            </p>

            {/* Feature Highlights Bar */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-2 text-xs font-bold text-slate-700">
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                <Quote className="w-3.5 h-3.5 text-indigo-600" />
                <span>Verbatim Quoted Evidence</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Plain-Language Clauses</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Deadlines & Milestones</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero Persistence</span>
              </div>
            </div>
          </div>

          {/* Legal Safety Notice Card */}
          <SafetyNotice />
        </section>

        {/* 2. Document Workspace */}
        <section id="workspace-section" className="space-y-4">
          <DocumentInput
            documentText={documentText}
            setDocumentText={setDocumentText}
            documentTitle={documentTitle}
            setDocumentTitle={setDocumentTitle}
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
            errorMessage={errorMessage}
          />
        </section>

        {/* 3. Loading State Skeleton */}
        {isLoading && (
          <section className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-6 animate-pulse">
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <div className="space-y-2">
                <div className="h-4 bg-blue-100 rounded-lg w-32" />
                <div className="h-7 bg-slate-200 rounded-xl w-72" />
              </div>
              <div className="flex gap-2">
                <div className="h-9 bg-slate-100 rounded-xl w-24" />
                <div className="h-9 bg-slate-100 rounded-xl w-24" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="h-20 bg-slate-50 border border-slate-200 rounded-2xl" />
              <div className="h-20 bg-slate-50 border border-slate-200 rounded-2xl" />
              <div className="h-20 bg-slate-50 border border-slate-200 rounded-2xl" />
              <div className="h-20 bg-slate-50 border border-slate-200 rounded-2xl" />
            </div>

            <div className="space-y-3">
              <div className="h-4 bg-slate-100 rounded w-full" />
              <div className="h-4 bg-slate-100 rounded w-5/6" />
              <div className="h-4 bg-slate-100 rounded w-4/6" />
            </div>

            <div className="flex items-center justify-center gap-3 pt-6 text-xs font-bold text-slate-600">
              <div className="w-5 h-5 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Extracting clauses, obligations, and verifiable evidence via Google Gemini...</span>
            </div>
          </section>
        )}

        {/* 4. Analysis Results Dashboard */}
        {analysisResult && !isLoading && (
          <section id="results-section" className="space-y-8 scroll-mt-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                  <FileSearch className="w-6 h-6 text-blue-600" />
                  Legal Analysis Results
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Grounded breakdown of clauses, party duties, and actionable review points.
                </p>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-2xs cursor-pointer self-start sm:self-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Start New Analysis</span>
              </button>
            </div>

            <AnalysisResults
              result={analysisResult}
              documentTitle={documentTitle}
            />

            {/* 5. Document Q&A Section */}
            <DocumentQA documentText={analyzedDocText || documentText} />
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
