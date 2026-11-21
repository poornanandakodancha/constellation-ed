"use client";

import { useState } from "react";
import { X, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import confetti from "canvas-confetti";
import { Misconception } from "@/types";

interface CounterExampleModalProps {
  misconception: Misconception | null;
  onClose: () => void;
  onResolved: () => void;
}

export function CounterExampleModal({
  misconception,
  onClose,
  onResolved
}: CounterExampleModalProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    evaluated: boolean;
    isCorrect: boolean;
    explanation: string;
  } | null>(null);

  if (!misconception) return null;

  const counterQ = misconception.counter_example_question;

  const handleSubmit = async () => {
    if (selectedOption === null || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/misconception/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: "student_demo",
          misconceptionId: misconception.id,
          chosenIndex: selectedOption
        })
      });
      const data = await res.json();

      if (data.success) {
        setResult({
          evaluated: true,
          isCorrect: data.is_correct,
          explanation: data.explanation
        });

        if (data.is_correct) {
          confetti({
            particleCount: 75,
            spread: 70,
            origin: { y: 0.6 }
          });
          onResolved();
        }
      }
    } catch (err) {
      console.error("Failed to submit counter-example answer:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-xl cosmic-card rounded-2xl border border-rose-500/40 p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                Cognitive Repair Challenge
              </span>
              <span className="text-xs text-slate-400">Targeted Counter-Example</span>
            </div>
            <h3 className="text-lg font-black text-white">
              Deconstructing: &ldquo;{misconception.name}&rdquo;
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Challenge Prompt */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 mb-4">
          <p className="text-sm font-semibold text-slate-100 leading-relaxed">
            {counterQ.question}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-2.5 mb-5">
          {counterQ.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            let optionStyle = "border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 text-slate-300";

            if (result?.evaluated) {
              if (idx === counterQ.correct_index) {
                optionStyle = "border-emerald-500/60 bg-emerald-950/40 text-emerald-200";
              } else if (isSelected && !result.isCorrect) {
                optionStyle = "border-rose-500/60 bg-rose-950/40 text-rose-200";
              }
            } else if (isSelected) {
              optionStyle = "border-indigo-500 bg-indigo-950/40 text-white shadow-md shadow-indigo-500/10";
            }

            return (
              <button
                key={idx}
                disabled={result?.evaluated || isSubmitting}
                onClick={() => setSelectedOption(idx)}
                className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-start gap-3 ${optionStyle}`}
              >
                <span className="w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center font-bold text-xs bg-slate-800/80">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="leading-relaxed">{option}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback / Result Banner */}
        {result?.evaluated && (
          <div
            className={`p-4 rounded-xl border mb-5 ${
              result.isCorrect
                ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-200"
                : "bg-rose-950/60 border-rose-500/40 text-rose-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5 font-bold text-sm">
              {result.isCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Cognitive Bug Resolved! Star Brightness Restored</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                  <span>Intuitive Trap: Let&apos;s Review Why</span>
                </>
              )}
            </div>
            <p className="text-xs leading-relaxed opacity-90">{result.explanation}</p>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3">
          {result?.evaluated ? (
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white transition-colors"
            >
              Return to Sky
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={selectedOption === null || isSubmitting}
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 disabled:opacity-40 text-white shadow-lg shadow-rose-500/20 flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? "Evaluating Intuition…" : "Submit Reasoning"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
