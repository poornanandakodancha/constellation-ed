"use client";

import { Award, Zap, BookOpen, AlertTriangle } from "lucide-react";
import { ExamScorePrediction } from "@/lib/exam-score";

interface PredictedScoreGaugeProps {
  scoreData: ExamScorePrediction | null;
  onStartSession?: () => void;
  isLoading?: boolean;
}

export function PredictedScoreGauge({
  scoreData,
  onStartSession,
  isLoading = false
}: PredictedScoreGaugeProps) {
  const score = scoreData?.predicted_score ?? 20;
  const confidence = scoreData?.confidence_percentage ?? 25;
  const grade = scoreData?.letter_grade ?? "Needs Diagnostic";

  // Circular gauge math (radius = 48, perimeter = 2 * PI * 48 ≈ 301.59)
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="rounded-2xl cosmic-card p-5 border border-indigo-500/20 shadow-xl relative overflow-hidden">
      {/* Background celestial glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
        {/* Left: Animated Circular Score Arc */}
        <div className="flex items-center gap-5">
          <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background track */}
              <circle
                cx="56"
                cy="56"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-800/80"
                fill="transparent"
              />
              {/* Progress Arc */}
              <circle
                cx="56"
                cy="56"
                r={radius}
                stroke="url(#scoreGradient)"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#c084fc" />
                </linearGradient>
              </defs>
            </svg>

            {/* Score Value inside Circle */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black tracking-tight text-white">
                {score}
                <span className="text-base text-indigo-400 font-bold">%</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Predicted
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                Predicted Exam Score
              </h3>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-extrabold text-indigo-200">{grade}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Learner Model Confidence: </span>
              <span className="font-bold text-cyan-300">{confidence}%</span>
            </div>
          </div>
        </div>

        {/* Center: Concepts Breakdown */}
        {scoreData && (
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto text-center border-t md:border-t-0 md:border-l border-slate-800/80 pt-4 md:pt-0 md:pl-6">
            <div className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-semibold mb-0.5">
                <Zap className="w-3.5 h-3.5" />
                <span>Mastered</span>
              </div>
              <span className="text-xl font-bold text-white">{scoreData.mastered_concepts}</span>
              <span className="text-[10px] text-slate-400 block">stars</span>
            </div>

            <div className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-center gap-1.5 text-cyan-400 text-xs font-semibold mb-0.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Learning</span>
              </div>
              <span className="text-xl font-bold text-white">{scoreData.learning_concepts}</span>
              <span className="text-[10px] text-slate-400 block">stars</span>
            </div>

            <div className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs font-semibold mb-0.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Review Due</span>
              </div>
              <span className="text-xl font-bold text-white">{scoreData.unseen_or_struggling}</span>
              <span className="text-[10px] text-slate-400 block">stars</span>
            </div>
          </div>
        )}

        {/* Right: Primary Call to Action */}
        {onStartSession && (
          <button
            onClick={onStartSession}
            disabled={isLoading}
            className="w-full md:w-auto px-6 py-3.5 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-600 hover:via-purple-700 hover:to-pink-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Start Today&apos;s Session</span>
          </button>
        )}
      </div>
    </div>
  );
}
