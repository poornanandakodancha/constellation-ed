"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Clock, ShieldCheck, Brain, ArrowRight, Sparkles } from "lucide-react";
import { ExamScorePrediction } from "@/lib/exam-score";

interface KnowledgeTwinPanelProps {
  scoreData: ExamScorePrediction | null;
  todayQueueCount?: number;
  onStartReview?: () => void;
}

export function KnowledgeTwinPanel({
  scoreData,
  todayQueueCount = 3,
  onStartReview
}: KnowledgeTwinPanelProps) {
  const [selectedHorizonDay, setSelectedHorizonDay] = useState<number>(7);

  const currentScore = scoreData?.predicted_score ?? 20;

  // Spaced repetition progression math:
  // With SM-2 review: gain +2.5% to +3% per review day up to ~95%
  const projectedPlanScore = Math.min(
    96,
    Math.round(currentScore + (selectedHorizonDay / 7) * 18)
  );
  const planRetentionRate = Math.min(95, Math.round(75 + (selectedHorizonDay / 7) * 20));

  // Without review: Ebbinghaus forgetting curve decay (R(t) = e^(-t/S))
  const decayFactor = Math.exp(-selectedHorizonDay / 12);
  const projectedDecayScore = Math.max(15, Math.round(currentScore * decayFactor));
  const decayRetentionRate = Math.max(35, Math.round(85 * decayFactor));

  const scoreDelta = projectedPlanScore - currentScore;
  const decayDelta = currentScore - projectedDecayScore;

  return (
    <div className="rounded-2xl cosmic-card p-5 sm:p-6 border border-cyan-500/30 shadow-2xl space-y-5 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-black text-white">
              Knowledge Twin: 7-Day Cognitive Forecast
            </h3>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              SM-2 Predictive Horizon
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Compare your predicted exam score trajectory: Spaced-Repetition Plan vs. Natural Forgetting Curve Drift
          </p>
        </div>

        {/* Day Horizon Selector */}
        <div className="flex items-center gap-1.5 cosmic-glass p-1 rounded-xl self-end sm:self-auto text-xs font-bold">
          {[1, 3, 5, 7].map((day) => (
            <button
              key={day}
              onClick={() => setSelectedHorizonDay(day)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                selectedHorizonDay === day
                  ? "bg-cyan-500 text-slate-950 font-extrabold shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Day {day}
            </button>
          ))}
        </div>
      </div>

      {/* Dual Twin Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Twin A: Active Spaced Repetition Plan */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/40 shadow-lg relative overflow-hidden flex flex-col justify-between space-y-4">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Twin A · With Spaced Repetition Plan
              </span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                +{scoreDelta}% Gain
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-black text-white">{projectedPlanScore}%</span>
              <span className="text-xs text-slate-400">
                (Up from <span className="text-slate-300 font-bold">{currentScore}%</span> today)
              </span>
            </div>
            <p className="text-xs text-emerald-300/90 font-medium">
              Reviewing ~{todayQueueCount} concepts daily locks in long-term memory.
            </p>
          </div>

          {/* Progress Metrics */}
          <div className="space-y-2 text-xs pt-3 border-t border-emerald-500/20">
            <div className="flex items-center justify-between text-slate-300">
              <span>Estimated Memory Retention:</span>
              <span className="font-extrabold text-emerald-400">{planRetentionRate}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${planRetentionRate}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Expected Daily Effort:</span>
              <span className="font-semibold text-slate-200">3–5 minutes review</span>
            </div>
          </div>
        </div>

        {/* Twin B: Without Review / Forgetting Curve Drift */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-rose-950/30 to-slate-900 border border-slate-800 shadow-lg relative overflow-hidden flex flex-col justify-between space-y-4">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                <Clock className="w-3 h-3 text-rose-400" />
                Twin B · Without Review (Decay)
              </span>
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" />
                -{decayDelta}% Loss
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-black text-slate-300">{projectedDecayScore}%</span>
              <span className="text-xs text-slate-500">
                (Down from <span className="text-slate-400 font-bold">{currentScore}%</span> today)
              </span>
            </div>
            <p className="text-xs text-rose-300/80 font-medium">
              Ebbinghaus forgetting curve causes unreviewed pathways to dim.
            </p>
          </div>

          {/* Decay Metrics */}
          <div className="space-y-2 text-xs pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between text-slate-400">
              <span>Estimated Memory Retention:</span>
              <span className="font-extrabold text-rose-400">{decayRetentionRate}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-rose-500/70 h-full rounded-full transition-all duration-700"
                style={{ width: `${decayRetentionRate}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Risk:</span>
              <span className="font-semibold text-rose-400">Dimming of ~{Math.round(selectedHorizonDay * 1.5)} stars</span>
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Call to Action */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-300 text-center sm:text-left">
          <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            <strong>Takeaway:</strong> Reviewing today&apos;s <strong>{todayQueueCount} scheduled concepts</strong> prevents{" "}
            <span className="text-rose-400 font-bold">-{decayDelta}%</span> forgetting decay and sets up your{" "}
            <span className="text-emerald-400 font-bold">+{scoreDelta}% exam score gain</span> by Day {selectedHorizonDay}.
          </span>
        </div>

        {onStartReview && (
          <button
            onClick={onStartReview}
            className="w-full sm:w-auto px-4 py-2 rounded-lg font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all flex items-center justify-center gap-1.5 flex-shrink-0 shadow-lg shadow-cyan-500/20"
          >
            <span>Start Today&apos;s {todayQueueCount} Reviews</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
