import React from "react";
import { Scale, Sparkles, ShieldCheck, Lock } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-slate-200/80 bg-white/85 backdrop-blur-md sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 via-blue-900 to-indigo-700 text-white shadow-md shadow-blue-900/20 ring-1 ring-white/20">
            <Scale className="w-5 h-5 text-blue-200" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-slate-900">
                LEXORA <span className="text-blue-600 font-extrabold">LITE</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200/80 shadow-2xs">
                <Sparkles className="w-3 h-3 text-blue-600" />
                PromptWars Edition
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
              Understand Before You Sign
            </p>
          </div>
        </div>

        {/* Security & System Indicators */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100/90 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/80 transition-colors">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-medium text-[11px]">Zero Storage &bull; Private</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-blue-800 bg-blue-50/90 px-3 py-1.5 rounded-lg border border-blue-200 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[11px]">Grounded Legal AI</span>
          </div>
        </div>
      </div>
    </header>
  );
}
