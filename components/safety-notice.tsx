import React from "react";
import { ShieldCheck, Info, Sparkles } from "lucide-react";

interface SafetyNoticeProps {
  compact?: boolean;
}

export function SafetyNotice({ compact = false }: SafetyNoticeProps) {
  if (compact) {
    return (
      <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-amber-50/80 via-amber-50/40 to-slate-50 border border-amber-200/90 rounded-xl text-xs text-amber-950 shadow-2xs">
        <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-800">
          <Info className="w-3.5 h-3.5" />
        </div>
        <p className="leading-relaxed">
          <strong className="font-bold text-amber-950">Educational Legal Assistance Tool:</strong>{" "}
          LEXORA LITE translates contracts into plain language with verbatim text citations.
          It does not provide formal legal advice, determine binding legality, or replace a qualified attorney. Consult a licensed legal professional for situation-specific decisions.
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white p-6 sm:p-7 shadow-xl border border-slate-800">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/15 shadow-inner">
            <ShieldCheck className="w-6 h-6 text-blue-300" />
          </div>
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-300 bg-blue-500/20 px-2.5 py-0.5 rounded-md border border-blue-400/30">
                Educational Document Intelligence
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Safety & Educational Disclaimer
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              LEXORA LITE simplifies legal terminology for educational understanding. It does not provide legal representation, warranty validity, or replace a qualified attorney. Always consult a legal professional for binding contracts.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap md:flex-col gap-2 flex-shrink-0 w-full md:w-auto text-[11px] font-medium text-slate-300">
          <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Verbatim Source Quotes</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero Data Storage</span>
          </div>
        </div>
      </div>
    </div>
  );
}
