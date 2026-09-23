"use client";

import React, { useState } from "react";
import { ExtractedClause, ReviewLevel } from "@/types/analysis";
import {
  ShieldAlert,
  Info,
  HelpCircle,
  Quote,
  ChevronDown,
  ChevronUp,
  Check,
  Copy,
  Users,
  Tag,
  Sparkles,
  FileCheck2,
  AlertTriangle,
} from "lucide-react";

interface ClauseCardProps {
  clause: ExtractedClause;
  index: number;
}

export function ClauseCard({ clause, index }: ClauseCardProps) {
  const [isEvidenceExpanded, setIsEvidenceExpanded] = useState(true);
  const [copiedEvidence, setCopiedEvidence] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const copyEvidence = () => {
    if (clause.evidence) {
      navigator.clipboard.writeText(clause.evidence);
      setCopiedEvidence(true);
      setTimeout(() => setCopiedEvidence(false), 2000);
    }
  };

  const copyExplanation = () => {
    navigator.clipboard.writeText(`${clause.title}: ${clause.explanation}`);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const getBadgeStyle = (level: ReviewLevel) => {
    switch (level) {
      case "Review":
        return {
          container: "bg-amber-50 text-amber-900 border-amber-300",
          barColor: "border-l-amber-500",
          icon: ShieldAlert,
          label: "Review Needed",
        };
      case "Needs clarification":
        return {
          container: "bg-purple-50 text-purple-900 border-purple-300",
          barColor: "border-l-purple-500",
          icon: HelpCircle,
          label: "Needs Clarification",
        };
      case "Informational":
      default:
        return {
          container: "bg-sky-50 text-sky-900 border-sky-300",
          barColor: "border-l-blue-500",
          icon: Info,
          label: "Informational",
        };
    }
  };

  const getEvidenceBadge = (status?: string, isVerified?: boolean) => {
    if (isVerified || status === "verified") {
      return {
        label: "Verified in Source Text",
        container: "bg-emerald-50 text-emerald-800 border-emerald-300",
        icon: FileCheck2,
      };
    }
    if (status === "model_quoted") {
      return {
        label: "Model Supporting Reference",
        container: "bg-amber-50 text-amber-800 border-amber-300",
        icon: HelpCircle,
      };
    }
    if (status === "unverified") {
      return {
        label: "Unverified in Text • Review Needed",
        container: "bg-rose-50 text-rose-800 border-rose-300",
        icon: AlertTriangle,
      };
    }
    return {
      label: "Evidence Unavailable",
      container: "bg-slate-100 text-slate-600 border-slate-300",
      icon: Info,
    };
  };

  const badge = getBadgeStyle(clause.riskLevel);
  const BadgeIcon = badge.icon;
  const evidenceBadge = getEvidenceBadge(clause.evidenceStatus, clause.isVerified);
  const EvidenceBadgeIcon = evidenceBadge.icon;

  const hasValidEvidence =
    clause.evidence &&
    clause.evidence.trim() !== "" &&
    clause.evidence !== "No explicit clause text quoted." &&
    clause.evidence !== "No direct quote available." &&
    clause.evidence !== "Evidence unavailable in original document.";

  return (
    <article
      aria-labelledby={`clause-title-${index}`}
      className={`bg-white rounded-2xl border border-slate-200/90 border-l-4 ${badge.barColor} shadow-xs hover:shadow-md transition-all p-5 sm:p-6 space-y-4`}
    >
      {/* Header with Title & Level Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span
            aria-hidden="true"
            className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-black flex items-center justify-center flex-shrink-0"
          >
            {index + 1}
          </span>
          <h4
            id={`clause-title-${index}`}
            className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight"
          >
            {clause.title}
          </h4>
          {clause.category && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100/80 border border-slate-200 px-2.5 py-0.5 rounded-md">
              <Tag className="w-3 h-3 text-slate-400" aria-hidden="true" />
              {clause.category}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${badge.container}`}
          >
            <BadgeIcon className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
            <span>{badge.label}</span>
          </span>
        </div>
      </div>

      {/* Parties Involved & Supplied Document Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        {clause.parties && clause.parties.length > 0 ? (
          <div className="flex items-center gap-2 flex-wrap text-slate-500">
            <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" aria-hidden="true" />
            <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
              Binding Parties:
            </span>
            {clause.parties.map((party, pIdx) => (
              <span
                key={pIdx}
                className="bg-blue-50 text-blue-800 border border-blue-200/90 font-bold px-2.5 py-0.5 rounded-lg text-xs"
              >
                {party}
              </span>
            ))}
          </div>
        ) : (
          <div />
        )}

        <span className="text-[10px] font-semibold text-slate-600 bg-slate-100/80 border border-slate-200 px-2 py-0.5 rounded-md">
          Based on supplied document
        </span>
      </div>

      {/* 1. AI Plain Language Explanation Section */}
      <div className="text-slate-800 text-sm sm:text-base leading-relaxed bg-slate-50/80 p-4 rounded-xl border border-slate-200/70 relative">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
            AI Plain-Language Explanation
          </span>
          <button
            type="button"
            onClick={copyExplanation}
            aria-label={`Copy plain-language explanation for ${clause.title}`}
            className="text-[11px] text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-0.5"
          >
            {copiedSummary ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                <span className="text-emerald-700 font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" aria-hidden="true" />
                <span>Copy explanation</span>
              </>
            )}
          </button>
        </div>
        <p className="font-medium text-slate-800">{clause.explanation}</p>
      </div>

      {/* 2. Original Document Evidence Section (Separated Visually) */}
      {hasValidEvidence ? (
        <div className="border border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-slate-50 to-white rounded-xl overflow-hidden shadow-2xs">
          <button
            type="button"
            onClick={() => setIsEvidenceExpanded(!isEvidenceExpanded)}
            aria-expanded={isEvidenceExpanded}
            aria-controls={`evidence-content-${index}`}
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold text-indigo-950 hover:bg-indigo-50/80 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <div className="flex items-center gap-2">
              <Quote className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
              <span>Original Document Verbatim Evidence</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${evidenceBadge.container}`}
              >
                <EvidenceBadgeIcon className="w-3 h-3" aria-hidden="true" />
                <span>{evidenceBadge.label}</span>
              </span>
              {isEvidenceExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              )}
            </div>
          </button>

          {isEvidenceExpanded && (
            <div
              id={`evidence-content-${index}`}
              className="px-4 pb-4 pt-1 space-y-2.5 border-t border-indigo-100/60"
            >
              <blockquote className="text-xs text-slate-900 font-mono bg-white p-3.5 rounded-lg border-l-4 border-indigo-500 shadow-2xs leading-relaxed whitespace-pre-wrap">
                &ldquo;{clause.evidence}&rdquo;
              </blockquote>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                {clause.confidenceNote ? (
                  <span className="text-slate-500 italic">
                    Note: {clause.confidenceNote}
                  </span>
                ) : (
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" aria-hidden="true" /> Grounded in provided document
                  </span>
                )}
                <button
                  type="button"
                  onClick={copyEvidence}
                  aria-label={`Copy original quote for ${clause.title}`}
                  className="ml-auto inline-flex items-center gap-1 text-indigo-700 hover:text-indigo-950 font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded p-0.5"
                >
                  {copiedEvidence ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" aria-hidden="true" />
                      <span>Copy Exact Quote</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span className="font-semibold">Evidence unavailable in original document</span>
          </div>
          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
            Flagged for Review
          </span>
        </div>
      )}
    </article>
  );
}
