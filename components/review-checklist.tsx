"use client";

import React, { useState } from "react";
import {
  CheckSquare,
  Square,
  Copy,
  Check,
  RotateCcw,
  HelpCircle,
} from "lucide-react";

interface ReviewChecklistProps {
  items: string[];
}

export function ReviewChecklist({ items }: ReviewChecklistProps) {
  const [checkedState, setCheckedState] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);

  const toggleItem = (idx: number) => {
    setCheckedState((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggleItem(idx);
    }
  };

  const handleMarkAll = () => {
    const allChecked: Record<number, boolean> = {};
    items.forEach((_, idx) => {
      allChecked[idx] = true;
    });
    setCheckedState(allChecked);
  };

  const handleResetChecklist = () => {
    setCheckedState({});
  };

  const checkedCount = Object.values(checkedState).filter(Boolean).length;
  const totalCount = items?.length || 0;
  const progressPercent =
    totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  const handleCopyChecklist = () => {
    const text = items
      .map((item, idx) => `[${checkedState[idx] ? "x" : " "}] ${item}`)
      .join("\n");
    navigator.clipboard.writeText(
      `LEXORA LITE — Pre-Signing Review Checklist\n\n${text}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!items || items.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm bg-white rounded-2xl border border-slate-200">
        No specific review checklist items generated for this document.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs hover:shadow-md transition-all space-y-5">
      {/* Header & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" aria-hidden="true" />
            </div>
            Pre-Signing Review Checklist
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Actionable clarification points to confirm with your counterparty or a qualified attorney.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div
            className="bg-slate-50 border border-slate-200/80 px-3.5 py-2 rounded-xl text-right flex items-center gap-3"
            aria-label={`${checkedCount} of ${totalCount} items reviewed, ${progressPercent} percent complete`}
          >
            <div>
              <div className="text-xs font-black text-slate-900">
                {checkedCount} / {totalCount} Reviewed
              </div>
              <div className="text-[10px] font-semibold text-indigo-600">
                {progressPercent}% Complete
              </div>
            </div>
            <div
              className="w-16 h-2.5 bg-slate-200 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyChecklist}
              aria-label="Copy checklist to clipboard"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Copy List</span>
                </>
              )}
            </button>

            {checkedCount > 0 && (
              <button
                type="button"
                onClick={handleResetChecklist}
                aria-label="Reset checklist checkboxes"
                className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick toggle bar */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Interactive Action Items
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleMarkAll}
            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer focus:outline-none focus:underline"
          >
            Mark all complete
          </button>
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-2.5" role="list" aria-label="Review Items">
        {items.map((item, idx) => {
          const isChecked = !!checkedState[idx];
          return (
            <div
              key={idx}
              role="checkbox"
              tabIndex={0}
              aria-checked={isChecked}
              onClick={() => toggleItem(idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={`flex items-start gap-3.5 p-3.5 rounded-xl border transition-all cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                isChecked
                  ? "bg-slate-50 border-slate-200 text-slate-400 opacity-80"
                  : "bg-white hover:bg-indigo-50/30 border-slate-200/90 hover:border-indigo-300 text-slate-900 shadow-2xs"
              }`}
            >
              <span className="flex-shrink-0 mt-0.5 text-indigo-600">
                {isChecked ? (
                  <CheckSquare className="w-5 h-5 text-emerald-600 fill-emerald-50" aria-hidden="true" />
                ) : (
                  <Square className="w-5 h-5 text-slate-300 hover:text-indigo-500 transition-colors" aria-hidden="true" />
                )}
              </span>
              <span
                className={`text-sm font-medium leading-relaxed ${
                  isChecked
                    ? "line-through text-slate-400"
                    : "text-slate-800 font-semibold"
                }`}
              >
                {item}
              </span>
            </div>
          );
        })}
      </div>

      <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
        <HelpCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <p>
          <strong>Attorney Discussion Guide:</strong> Items in this checklist reflect standard clauses that may require commercial alignment or customized drafting before signature.
        </p>
      </div>
    </div>
  );
}
