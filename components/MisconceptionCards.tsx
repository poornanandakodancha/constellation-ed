"use client";

import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { Misconception, MisconceptionLog } from "@/types";
import misconceptionsData from "@/data/misconceptions.json";

interface MisconceptionCardsProps {
  logs: MisconceptionLog[];
  onOpenCounterExample: (misconception: Misconception) => void;
}

export function MisconceptionCards({ logs, onOpenCounterExample }: MisconceptionCardsProps) {
  const activeLogs = logs.filter((l) => !l.resolved);

  if (activeLogs.length === 0) {
    return (
      <div className="rounded-2xl cosmic-card p-6 border border-emerald-500/20 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 mx-auto flex items-center justify-center mb-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
        </div>
        <h3 className="text-base font-extrabold text-white mb-1">
          Constellations In Clear Orbit
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          No active mental model bugs detected in your reasoning. Your physics intuition aligns with empirical conservation laws.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500 animate-flare" />
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-rose-300">
            Detected Mental Model Bugs ({activeLogs.length})
          </h3>
        </div>
        <span className="text-xs text-slate-400">
          Identified from your typed reasoning
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeLogs.map((log) => {
          const misc = (misconceptionsData as Misconception[]).find(
            (m) => m.id === log.misconception_id
          );
          if (!misc) return null;

          return (
            <div
              key={log.id}
              className="rounded-2xl flare-card p-5 border border-rose-500/30 flex flex-col justify-between shadow-xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

              <div>
                {/* Header Tag */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    Solar Flare Bug
                  </span>
                  <span className="text-xs text-rose-400 font-semibold">
                    Confidence: {(log.confidence * 100).toFixed(0)}%
                  </span>
                </div>

                <h4 className="text-base font-black text-white mb-2 leading-tight">
                  Bug Found: &ldquo;{misc.name}&rdquo;
                </h4>

                {/* Evidence Quote */}
                {log.reasoning_evidence && (
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-rose-500/20 mb-3 text-xs italic text-rose-200">
                    &ldquo;{log.reasoning_evidence}&rdquo;
                  </div>
                )}

                {/* Why it feels true vs reality */}
                <div className="space-y-2 text-xs mb-4">
                  <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800">
                    <span className="text-amber-400 font-bold block mb-0.5">
                      💡 Why it feels true:
                    </span>
                    <p className="text-slate-300 leading-relaxed">{misc.why_it_feels_true}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800">
                    <span className="text-emerald-400 font-bold block mb-0.5">
                      🔬 The Physical Reality:
                    </span>
                    <p className="text-slate-300 leading-relaxed">{misc.scientific_truth}</p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onOpenCounterExample(misc)}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Fix Bug via Counter-Example</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
