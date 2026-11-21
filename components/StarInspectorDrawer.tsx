"use client";

import { X, Sparkles, AlertCircle, ArrowRight, ShieldCheck, Clock, Zap } from "lucide-react";
import { ConstellationConcept } from "./ConstellationCanvas";

interface StarInspectorDrawerProps {
  concept: ConstellationConcept | null;
  onClose: () => void;
  onPracticeConcept: (conceptId: string) => void;
  isLoading?: boolean;
}

export function StarInspectorDrawer({
  concept,
  onClose,
  onPracticeConcept,
  isLoading = false
}: StarInspectorDrawerProps) {
  if (!concept) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-slate-950/95 backdrop-blur-xl border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              {concept.cluster}
            </span>
            <h2 className="text-xl font-extrabold text-white mt-2 leading-snug">
              {concept.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Misconception Flare Warning */}
        {concept.has_misconception && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 flex items-start gap-3 animate-flare">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-rose-200">Active Red Solar Flare</h4>
              <p className="text-xs text-rose-300/90 mt-0.5">
                A mental model misconception was detected in your recent reasoning. Solve the counter-example challenge to clear it.
              </p>
            </div>
          </div>
        )}

        {/* Concept Explanation */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 mb-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Concept Essence</span>
          </h4>
          <p className="text-sm text-slate-200 leading-relaxed">
            {concept.short_explanation}
          </p>
        </div>

        {/* Mastery Gauge & BKT State */}
        <div className="space-y-4 mb-6">
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-medium">Mastery Probability P(L)</span>
              <span className="font-extrabold text-cyan-400">
                {(concept.p_mastery * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  concept.p_mastery >= 0.8
                    ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_#10b981]"
                    : concept.p_mastery >= 0.4
                    ? "bg-gradient-to-r from-cyan-500 to-indigo-500"
                    : "bg-gradient-to-r from-rose-500 to-amber-500"
                }`}
                style={{ width: `${Math.max(5, concept.p_mastery * 100)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Difficulty Level</span>
              <div className="flex items-center gap-1 mt-1 text-amber-400 font-bold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={i < concept.difficulty ? "text-amber-400" : "text-slate-700"}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Attempts Logged</span>
              <span className="text-sm font-bold text-white block mt-0.5">
                {concept.attempts} answers
              </span>
            </div>
          </div>

          {/* SM-2 Spaced Repetition Stats */}
          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Spaced Repetition (SM-2)</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  concept.is_due
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                }`}
              >
                {concept.is_due ? "Review Due" : "Retained"}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <span>Interval: {concept.interval_days || 1} day(s)</span>
              <span>Ease Factor: {concept.ease_factor || 2.5}</span>
            </div>
          </div>

          {/* Prerequisites */}
          {concept.prerequisites && concept.prerequisites.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Required Prerequisites</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {concept.prerequisites.map((prereqId) => (
                  <span
                    key={prereqId}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700"
                  >
                    {prereqId.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Action */}
      <div className="pt-4 border-t border-slate-800">
        <button
          onClick={() => onPracticeConcept(concept.concept_id)}
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>Practice This Concept</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
