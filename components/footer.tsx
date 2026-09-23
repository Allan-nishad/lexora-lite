import React from "react";
import { ShieldCheck, Lock, Scale, Sparkles, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200/90 bg-white/70 backdrop-blur-md py-10 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border-b border-slate-100 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-slate-900 via-blue-900 to-indigo-700 flex items-center justify-center text-white shadow-2xs">
                <Scale className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-slate-900 text-sm tracking-tight">
                LEXORA <span className="text-blue-600">LITE</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                Understand Before You Sign
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Transforming complex legal contracts into plain language with verbatim grounded evidence.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap text-[11px] font-semibold">
            <div className="flex items-center gap-1.5 text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Zero Document Storage</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Verbatim Quoted Grounding</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Google Gemini AI</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-slate-400">
          <p>
            Developed for the PromptWars Virtual Exclusive Edition &bull; AI for Legal Assistance & Access. Educational tool only, not formal legal counsel.
          </p>
          <div className="flex items-center gap-1 text-slate-500 font-medium">
            <span>Built with</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
            <span>&bull; &copy; {new Date().getFullYear()} Lexora Lite</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
