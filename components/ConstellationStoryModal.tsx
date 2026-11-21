"use client";

import { Award, Sparkles, CheckCircle2, Clock, X, ArrowRight, ShieldCheck, Flame } from "lucide-react";

export interface ConstellationStoryData {
  starsLitCount: number;
  bugsFixedCount: number;
  starsNeedReviewCount: number;
  starsDetails?: { name: string; oldP: number; newP: number }[];
  examScoreGain?: number;
  storyNarrative?: string;
}

interface ConstellationStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: ConstellationStoryData | null;
}

export function ConstellationStoryModal({
  isOpen,
  onClose,
  story
}: ConstellationStoryModalProps) {
  if (!isOpen || !story) return null;

  const narrative =
    story.storyNarrative ||
    `Tonight in your sector of the cosmos, you lit ${story.starsLitCount} stars as your mental model forged new neural pathways across Class 10 Electricity. ${
      story.bugsFixedCount > 0
        ? `You dismantled ${story.bugsFixedCount} stubborn misconception bug through counter-intuitive evidence, extinguishing its red flare.`
        : "Your reasoning was grounded in charge conservation laws with zero active bugs."
    } ${
      story.starsNeedReviewCount > 0
        ? `${story.starsNeedReviewCount} stars are scheduled for spaced repetition review tomorrow to safeguard your knowledge against Ebbinghaus decay.`
        : "All concepts remain well-stabilized."
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-lg cosmic-card rounded-2xl border border-indigo-500/40 p-6 sm:p-7 shadow-[0_0_50px_rgba(99,102,241,0.25)] relative overflow-hidden space-y-6">
        {/* Background glow highlights */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header with Close */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-6 h-6 text-amber-300 animate-spin" style={{ animationDuration: "10s" }} />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                Session Constellation Story
              </span>
              <h3 className="text-xl font-black text-white mt-0.5">
                Tonight&apos;s Orbit Completed
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Headline Stat Cards: Lit, Fixed, Review Due */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 text-center">
          {/* Lit Stars */}
          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 text-cyan-400 mb-1">
              <Sparkles className="w-4 h-4" />
              <span className="text-2xl font-black text-white">{story.starsLitCount}</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
              Stars Lit
            </span>
          </div>

          {/* Bugs Repaired */}
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 text-emerald-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-2xl font-black text-white">{story.bugsFixedCount}</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
              Bug Fixed
            </span>
          </div>

          {/* Review Due Tomorrow */}
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 text-amber-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-2xl font-black text-white">{story.starsNeedReviewCount}</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
              Review Tomorrow
            </span>
          </div>
        </div>

        {/* The Poetic Narrative */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-300">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>The Celestial Narrative</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed italic">
            &ldquo;{narrative}&rdquo;
          </p>
        </div>

        {/* Detailed Stars Brightened (if provided) */}
        {story.starsDetails && story.starsDetails.length > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Ascending Star Nodes:
            </span>
            <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
              {story.starsDetails.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs px-3 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800"
                >
                  <span className="font-semibold text-slate-200">{s.name}</span>
                  <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                    <span className="text-slate-500 line-through">{(s.oldP * 100).toFixed(0)}%</span>
                    <span>→</span>
                    <span className="text-emerald-400">{(s.newP * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-500 via-purple-600 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all"
        >
          <span>Return to Your Constellation Sky</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
