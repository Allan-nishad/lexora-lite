import React from "react";
import { ObligationItem } from "@/types/analysis";
import { Users, CheckCircle2, Quote, Shield, FileCheck2, AlertTriangle } from "lucide-react";

interface ObligationsPanelProps {
  obligations: ObligationItem[];
}

export function ObligationsPanel({ obligations }: ObligationsPanelProps) {
  if (!obligations || obligations.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm bg-white rounded-2xl border border-slate-200">
        No specific party obligations explicitly declared in this document.
      </div>
    );
  }

  // Group by party
  const grouped = obligations.reduce<Record<string, ObligationItem[]>>(
    (acc, curr) => {
      const party = curr.party || "General / Mutual";
      if (!acc[party]) acc[party] = [];
      acc[party].push(curr);
      return acc;
    },
    {}
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.entries(grouped).map(([party, items], idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-slate-900 text-base">{party}</h4>
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-full">
                      {items.length} {items.length > 1 ? "Duties" : "Duty"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Explicit obligations identified in text
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-semibold text-slate-600 bg-slate-100/80 border border-slate-200 px-2 py-0.5 rounded-md hidden sm:inline">
                Based on supplied document
              </span>
            </div>

            <div className="space-y-3">
              {items.map((item, itemIdx) => {
                const hasEvidence =
                  item.evidence &&
                  item.evidence.trim() !== "" &&
                  item.evidence !== "No direct quote available." &&
                  item.evidence !== "Evidence unavailable in original document.";

                return (
                  <div
                    key={itemIdx}
                    className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-2.5"
                  >
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                        {item.obligation}
                      </span>
                    </div>

                    {hasEvidence ? (
                      <div className="pl-6 space-y-1">
                        <div className="flex items-start gap-1.5 text-[11px] text-slate-700 italic bg-white p-2.5 rounded-lg border border-slate-200 font-mono shadow-2xs">
                          <Quote className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                          <span>&ldquo;{item.evidence}&rdquo;</span>
                        </div>
                        {item.isVerified && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                            <FileCheck2 className="w-3 h-3" />
                            <span>Verified in source text</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="pl-6 text-[11px] text-amber-800 italic flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        <span>Evidence unavailable in document</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-slate-400" />
              <span>Bound by contractual clauses</span>
            </div>
            <span className="text-[10px] text-slate-400">Grounded analysis</span>
          </div>
        </div>
      ))}
    </div>
  );
}
