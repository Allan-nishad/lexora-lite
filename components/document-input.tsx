"use client";

import React, { useState, useRef } from "react";
import {
  Trash2,
  Play,
  Sparkles,
  AlertCircle,
  Upload,
  Clock,
  Check,
  FileSignature,
  FileCheck,
} from "lucide-react";

export const SAMPLE_SERVICE_AGREEMENT = `SERVICE AGREEMENT

The Client shall pay the Service Provider within 30 days of receiving a valid invoice.

Either party may terminate this agreement by providing 30 days written notice.

The Service Provider shall keep confidential all non-public information received from the Client.

The Service Provider shall deliver the agreed services according to the project requirements.

The Client shall provide the information reasonably required for the Service Provider to complete the services.`;

export const SAMPLE_NDA = `MUTUAL NON-DISCLOSURE AGREEMENT

1. Confidential Information: Both parties agree to protect proprietary technical, financial, and business information disclosed during discussions.
2. Non-Disclosure Period: The receiving party shall hold all confidential information strictly confidential for a period of 2 years from the date of disclosure.
3. Standard of Care: The receiving party shall use the same degree of care as it uses to protect its own confidential information, but not less than reasonable care.
4. Exclusions: Confidential information does not include information that is publicly known through no breach, or was already known prior to disclosure.
5. Remedies: Unauthorized disclosure may cause irreparable harm for which damages may not be an adequate remedy, entitling injunctive relief.`;

export const SAMPLE_FREELANCE = `INDEPENDENT CONTRACTOR AGREEMENT

1. Scope: The Contractor shall provide web development and design services as detailed in Statement of Work #1.
2. Compensation: The Client agrees to pay the Contractor $85/hour, payable bi-weekly within 14 days of invoice submission.
3. Late Payment: Invoices unpaid after 30 days shall accrue interest at 1.5% per month.
4. Intellectual Property: Upon full payment of all fees, all deliverables and custom code shall become the sole property of the Client.
5. Independent Status: Nothing in this Agreement shall create an employer-employee relationship, partnership, or joint venture.`;

interface DocumentInputProps {
  documentText: string;
  setDocumentText: (text: string) => void;
  documentTitle: string;
  setDocumentTitle: (title: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  errorMessage?: string | null;
}

export function DocumentInput({
  documentText,
  setDocumentText,
  documentTitle,
  setDocumentTitle,
  onAnalyze,
  isLoading,
  errorMessage,
}: DocumentInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const characterCount = documentText.length;
  const wordCount = documentText.trim()
    ? documentText.trim().split(/\s+/).length
    : 0;
  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200));

  const handleClear = () => {
    setDocumentText("");
    setDocumentTitle("");
    setActivePreset(null);
  };

  const loadSample = (id: string, title: string, content: string) => {
    setDocumentTitle(title);
    setDocumentText(content);
    setActivePreset(id);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setDocumentText(content);
        setDocumentTitle(file.name.replace(/\.[^/.]+$/, ""));
        setActivePreset(null);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (!isLoading && documentText.trim().length >= 10) {
        onAnalyze();
      }
    }
  };

  return (
    <section
      aria-label="Document Input Workspace"
      aria-busy={isLoading}
      className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-5 sm:p-7 space-y-5"
    >
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileSignature className="w-4 h-4" aria-hidden="true" />
            </div>
            Document Input Workspace
          </h2>
          <p id="workspace-desc" className="text-xs text-slate-500 mt-1">
            Paste contract text, terms of service, or load a preset sample below.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* File upload hidden input */}
          <input
            type="file"
            id="file-upload-input"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt,.md,.text"
            className="hidden"
            aria-label="Upload document as text file"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Upload document text file"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            <span>Upload Text File</span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={!documentText && !documentTitle}
            aria-label="Clear document text and title"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 rounded-xl transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Quick Sample Selector Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-600" aria-hidden="true" />
            Quick Demo Presets:
          </span>
          {activePreset && (
            <span
              aria-live="polite"
              className="text-[11px] text-blue-600 font-semibold flex items-center gap-1"
            >
              <Check className="w-3 h-3" aria-hidden="true" /> Sample loaded
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" role="group" aria-label="Sample Document Presets">
          <button
            type="button"
            onClick={() =>
              loadSample("service", "Service Agreement (Standard)", SAMPLE_SERVICE_AGREEMENT)
            }
            aria-pressed={activePreset === "service"}
            className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              activePreset === "service"
                ? "bg-blue-50/80 border-blue-400 ring-2 ring-blue-500/10 text-blue-950"
                : "bg-slate-50/70 hover:bg-slate-100/80 border-slate-200 text-slate-700"
            }`}
          >
            <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
              Service Agreement
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
              Payment (30d), 30d notice & confidentiality
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              loadSample("nda", "Mutual Non-Disclosure Agreement", SAMPLE_NDA)
            }
            aria-pressed={activePreset === "nda"}
            className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              activePreset === "nda"
                ? "bg-blue-50/80 border-blue-400 ring-2 ring-blue-500/10 text-blue-950"
                : "bg-slate-50/70 hover:bg-slate-100/80 border-slate-200 text-slate-700"
            }`}
          >
            <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
              Mutual NDA
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
              2-year term, standard of care, exclusions
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              loadSample("contractor", "Independent Contractor Agreement", SAMPLE_FREELANCE)
            }
            aria-pressed={activePreset === "contractor"}
            className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              activePreset === "contractor"
                ? "bg-blue-50/80 border-blue-400 ring-2 ring-blue-500/10 text-blue-950"
                : "bg-slate-50/70 hover:bg-slate-100/80 border-slate-200 text-slate-700"
            }`}
          >
            <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
              Contractor Agreement
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
              Hourly rate, IP transfer & late fees
            </p>
          </button>
        </div>
      </div>

      {/* Document Title Input */}
      <div>
        <label
          htmlFor="doc-title"
          className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
        >
          Document Title / Tag (Optional)
        </label>
        <input
          id="doc-title"
          type="text"
          value={documentTitle}
          onChange={(e) => {
            setDocumentTitle(e.target.value);
            setActivePreset(null);
          }}
          placeholder="e.g. Client Services Agreement 2026"
          maxLength={150}
          className="w-full px-4 py-2.5 text-sm bg-slate-50/60 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 transition-all placeholder:text-slate-400 font-medium"
        />
      </div>

      {/* Main Text Area */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="doc-text"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
          >
            Legal Document Text <span className="text-rose-500" aria-label="required">*</span>
          </label>
          {wordCount > 0 && (
            <span
              aria-live="polite"
              className="text-[11px] text-slate-500 flex items-center gap-1"
            >
              <Clock className="w-3 h-3 text-slate-400" aria-hidden="true" />
              ~{estimatedReadTime} min read
            </span>
          )}
        </div>

        <div className="relative">
          <textarea
            id="doc-text"
            value={documentText}
            onChange={(e) => {
              setDocumentText(e.target.value);
              setActivePreset(null);
            }}
            onKeyDown={handleKeyDown}
            rows={10}
            aria-required="true"
            aria-describedby={errorMessage ? "doc-input-error workspace-desc" : "workspace-desc"}
            aria-invalid={!!errorMessage}
            placeholder="Paste contract clauses, terms, conditions, leases, or vendor agreements here..."
            className="w-full px-4 py-3.5 text-sm font-mono leading-relaxed bg-slate-50/40 border border-slate-200/90 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 transition-all resize-y placeholder:font-sans placeholder:text-slate-400 shadow-inner"
          />
        </div>

        {/* Counter & Hint */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-1.5 px-1 pt-1">
          <div className="flex items-center gap-3" aria-live="polite">
            <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium text-slate-700 text-[11px]">
              {characterCount.toLocaleString()} chars
            </span>
            <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium text-slate-700 text-[11px]">
              {wordCount.toLocaleString()} words
            </span>
            <span className="hidden sm:inline text-slate-400 text-[11px]">
              (Max 100,000 characters)
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            Press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-600 font-mono font-bold">Ctrl+Enter</kbd> to analyze
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div
          id="doc-input-error"
          role="alert"
          aria-live="assertive"
          className="p-4 bg-rose-50/90 border border-rose-200 rounded-xl flex items-start gap-3 text-xs text-rose-900 shadow-2xs"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1 font-semibold">{errorMessage}</div>
        </div>
      )}

      {/* Action CTA Button */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-[11px] text-slate-400 text-center sm:text-left">
          🔒 Documents are analyzed in-memory and never saved to any database.
        </p>

        <button
          type="button"
          onClick={onAnalyze}
          disabled={isLoading || documentText.trim().length < 10}
          aria-busy={isLoading}
          aria-label={isLoading ? "Analyzing document with AI" : "Analyze document"}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:from-blue-800 active:to-indigo-800 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 transition-all transform active:scale-98 disabled:opacity-50 disabled:pointer-events-none disabled:transform-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
              <span>Analyzing with Google Gemini...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" aria-hidden="true" />
              <span>Analyze Document</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
}
