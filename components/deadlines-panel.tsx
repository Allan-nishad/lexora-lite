import React from "react";
import { DeadlineItem } from "@/types/analysis";
import { Clock, Quote, Hourglass, FileCheck2, AlertTriangle } from "lucide-react";

interface DeadlinesPanelProps {
  deadlines: DeadlineItem[];
}

export function DeadlinesPanel({ deadlines }: DeadlinesPanelProps) {
  if (!deadlines || deadlines.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm bg-white rounded-2xl border border-slate-200">
        No explicit deadlines or fixed time periods detected in this document.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {deadlines.map((item, idx) => {
        const hasEvidence =
          item.evidence &&
          item.evidence.trim() !== "" &&
          item.evidence !== "No direct quote available." &&
          item.evidence !== "Evidence unavailable in original document.";

        return (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-900 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg shadow-2xs">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  {item.timeframe}
                </span>
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <Hourglass className="w-3 h-3 text-slate-400" />
                  Timeline Item #{idx + 1}
                </span>
              </div>

              <p className="text-sm sm:text-base text-slate-900 font-bold leading-snug">
                {item.description}
              </p>
            </div>

            {hasEvidence ? (
              <div className="text-xs text-slate-800 italic bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 font-mono space-y-1.5">
                <div className="flex items-center justify-between not-italic font-sans text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-slate-400">Verbatim Evidence Quote</span>
                  {item.isVerified && (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <FileCheck2 className="w-3 h-3" />
                      Verified in text
                    </span>
                  )}
                </div>
                <div className="flex items-start gap-1.5">
                  <Quote className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <span>&ldquo;{item.evidence}&rdquo;</span>
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900 italic flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span>Evidence unavailable in original document</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
