"use client";

import React, { useState } from "react";
import { AnalysisResult } from "@/types/analysis";
import { ClauseCard } from "./clause-card";
import { ObligationsPanel } from "./obligations-panel";
import { DeadlinesPanel } from "./deadlines-panel";
import { ReviewChecklist } from "./review-checklist";
import { SafetyNotice } from "./safety-notice";
import {
  Clock,
  Users,
  CheckSquare,
  HelpCircle,
  Search,
  Download,
  Copy,
  Check,
  ShieldAlert,
  Layers,
} from "lucide-react";

interface AnalysisResultsProps {
  result: AnalysisResult;
  documentTitle?: string;
}

export function AnalysisResults({ result, documentTitle }: AnalysisResultsProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"clauses" | "obligations" | "deadlines" | "checklist">("clauses");
  const [copiedAll, setCopiedAll] = useState(false);

  const clauses = result.clauses || [];
  const reviewCount = clauses.filter((c) => c.riskLevel === "Review").length;
  const clarifyCount = clauses.filter((c) => c.riskLevel === "Needs clarification").length;
  const infoCount = clauses.filter((c) => c.riskLevel === "Informational").length;

  const filteredClauses = clauses.filter((c) => {
    // Level filter
    if (selectedFilter !== "ALL" && c.riskLevel !== selectedFilter) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchExp = c.explanation.toLowerCase().includes(q);
      const matchCat = c.category?.toLowerCase().includes(q);
      const matchParty = c.parties?.some((p) => p.toLowerCase().includes(q));
      return matchTitle || matchExp || matchCat || matchParty;
    }
    return true;
  });

  const exportMarkdown = () => {
    let md = `# LEXORA LITE Document Analysis Report\n`;
    md += `**Document Type:** ${result.documentType || "Legal Document"}\n`;
    if (documentTitle) md += `**Title:** ${documentTitle}\n`;
    md += `\n## Executive Summary\n${result.summary}\n\n`;

    md += `## Extracted Clauses (${clauses.length})\n`;
    clauses.forEach((c, idx) => {
      md += `### ${idx + 1}. ${c.title} [${c.riskLevel}]\n`;
      md += `**Category:** ${c.category}\n`;
      md += `**Applies to:** ${c.parties?.join(", ") || "General"}\n`;
      md += `**Plain Meaning:** ${c.explanation}\n`;
      if (c.evidence) md += `**Original Quote:** "${c.evidence}"\n\n`;
    });

    if (result.obligations?.length) {
      md += `## Party Obligations\n`;
      result.obligations.forEach((o) => {
        md += `- **${o.party}:** ${o.obligation} (Quote: "${o.evidence}")\n`;
      });
      md += `\n`;
    }

    if (result.deadlines?.length) {
      md += `## Deadlines & Milestones\n`;
      result.deadlines.forEach((d) => {
        md += `- **${d.timeframe}:** ${d.description} (Quote: "${d.evidence}")\n`;
      });
      md += `\n`;
    }

    if (result.reviewChecklist?.length) {
      md += `## Pre-Signing Review Checklist\n`;
      result.reviewChecklist.forEach((item) => {
        md += `- [ ] ${item}\n`;
      });
      md += `\n`;
    }

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Lexora-Analysis-${(documentTitle || "document").replace(/\s+/g, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyAll = () => {
    let text = `LEXORA LITE ANALYSIS REPORT\n\n`;
    text += `DOCUMENT TYPE: ${result.documentType}\n`;
    text += `SUMMARY: ${result.summary}\n\n`;
    text += `CLAUSES:\n`;
    clauses.forEach((c, i) => {
      text += `${i + 1}. ${c.title} (${c.riskLevel}): ${c.explanation}\nEvidence: "${c.evidence}"\n\n`;
    });
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Executive Summary Card */}
      <div className="bg-gradient-to-br from-white via-white to-blue-50/30 rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider text-blue-800 bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg">
                {result.documentType || "Identified Legal Document"}
              </span>
              {documentTitle && (
                <span className="text-xs text-slate-500 font-semibold truncate max-w-xs bg-slate-100 px-2.5 py-1 rounded-lg">
                  {documentTitle}
                </span>
              )}
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Executive Document Summary
            </h3>
          </div>

          {/* Export / Copy Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleCopyAll}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer"
            >
              {copiedAll ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied Report</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Report</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={exportMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .MD</span>
            </button>
          </div>
        </div>

        {/* Metric Tiles Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Clauses
            </span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {clauses.length}
            </div>
          </div>

          <div className="p-3.5 bg-amber-50/70 border border-amber-200/90 rounded-2xl shadow-2xs">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              Review Needed
            </span>
            <div className="text-2xl font-black text-amber-950 mt-0.5">
              {reviewCount}
            </div>
          </div>

          <div className="p-3.5 bg-purple-50/70 border border-purple-200/90 rounded-2xl shadow-2xs">
            <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider block flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
              Clarification
            </span>
            <div className="text-2xl font-black text-purple-950 mt-0.5">
              {clarifyCount}
            </div>
          </div>

          <div className="p-3.5 bg-blue-50/70 border border-blue-200/90 rounded-2xl shadow-2xs">
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              Party Duties
            </span>
            <div className="text-2xl font-black text-blue-950 mt-0.5">
              {result.obligations?.length || 0}
            </div>
          </div>
        </div>

        {/* Plain Language Summary Paragraph */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-900 block">
            Plain-Language Overview:
          </span>
          <p className="text-slate-800 text-sm sm:text-base leading-relaxed font-medium">
            {result.summary}
          </p>
        </div>

        {/* Missing or Unclear Information Highlight */}
        {result.missingOrUnclearInfo && result.missingOrUnclearInfo.length > 0 && (
          <div className="p-4 bg-amber-50/70 border border-amber-200/90 rounded-2xl space-y-2 text-xs text-amber-950 shadow-2xs">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-amber-950">
              <HelpCircle className="w-4 h-4 text-amber-700" />
              Missing, Vague, or Unspecified Contract Terms:
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-800 pl-1">
              {result.missingOrUnclearInfo.map((gap, gIdx) => (
                <li key={gIdx} className="font-medium">
                  {gap}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 2. Interactive Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("clauses")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-extrabold rounded-xl transition-all cursor-pointer ${
            activeTab === "clauses"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Extracted Clauses ({clauses.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("obligations")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-extrabold rounded-xl transition-all cursor-pointer ${
            activeTab === "obligations"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Party Obligations ({result.obligations?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("deadlines")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-extrabold rounded-xl transition-all cursor-pointer ${
            activeTab === "deadlines"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Deadlines & Timeframes ({result.deadlines?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("checklist")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-extrabold rounded-xl transition-all cursor-pointer ${
            activeTab === "checklist"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Review Checklist ({result.reviewChecklist?.length || 0})</span>
        </button>
      </div>

      {/* Tab 1: Clauses */}
      {activeTab === "clauses" && (
        <div className="space-y-4">
          {/* Clause Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-400 mr-1 hidden sm:inline uppercase tracking-wider">
                Filter:
              </span>
              {[
                { label: "All Clauses", value: "ALL", count: clauses.length },
                { label: "Review Needed", value: "Review", count: reviewCount },
                { label: "Needs Clarification", value: "Needs clarification", count: clarifyCount },
                { label: "Informational", value: "Informational", count: infoCount },
              ].map((btn) => (
                <button
                  key={btn.value}
                  type="button"
                  onClick={() => setSelectedFilter(btn.value)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    selectedFilter === btn.value
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {btn.label} ({btn.count})
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clauses or parties..."
                className="pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full sm:w-56 text-slate-900 font-medium"
              />
            </div>
          </div>

          {/* Clauses List */}
          {filteredClauses.length > 0 ? (
            <div className="space-y-4">
              {filteredClauses.map((clause, idx) => (
                <ClauseCard key={idx} clause={clause} index={idx} />
              ))}
            </div>
          ) : (
            <div className="p-10 text-center text-slate-500 text-sm bg-white rounded-2xl border border-slate-200">
              No clauses matched the selected filter or search term.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Party Obligations */}
      {activeTab === "obligations" && (
        <ObligationsPanel obligations={result.obligations} />
      )}

      {/* Tab 3: Deadlines & Milestones */}
      {activeTab === "deadlines" && (
        <DeadlinesPanel deadlines={result.deadlines} />
      )}

      {/* Tab 4: Review Checklist */}
      {activeTab === "checklist" && (
        <ReviewChecklist items={result.reviewChecklist} />
      )}

      {/* Educational Notice Banner */}
      <SafetyNotice compact />
    </div>
  );
}
