"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, CheckCircle2, AlertCircle, Zap, TrendingUp, TrendingDown, MessageSquare } from "lucide-react";
import confetti from "canvas-confetti";
import { Question } from "@/types";

interface PracticeModalProps {
  conceptId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSessionUpdated: () => void;
}

export function PracticeModal({ conceptId, isOpen, onClose, onSessionUpdated }: PracticeModalProps) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [conceptInfo, setConceptInfo] = useState<{ id: string; name: string; cluster: string } | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [reasoning, setReasoning] = useState("");
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);

  useEffect(() => {
    if (isOpen && conceptId) {
      loadTargetedQuestion(conceptId);
    } else {
      reset();
    }
  }, [isOpen, conceptId]);

  const reset = () => {
    setQuestion(null);
    setSelectedOption(null);
    setReasoning("");
    setFeedback(null);
  };

  const loadTargetedQuestion = async (targetId: string) => {
    setIsLoading(true);
    reset();
    try {
      const res = await fetch("/api/practice/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: "student_demo", conceptId: targetId })
      });
      const data = await res.json();
      if (data.success && data.question) {
        setQuestion(data.question);
        setConceptInfo(data.concept);
        setStartTime(Date.now());
      }
    } catch (err) {
      console.error("Failed to generate targeted question:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedOption === null || !reasoning.trim() || !question || isSubmitting) return;

    setIsSubmitting(true);
    const responseTimeMs = Date.now() - startTime;

    try {
      const res = await fetch("/api/diagnostic/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: "student_demo",
          questionId: question.id,
          chosenOption: selectedOption,
          reasoning: reasoning.trim(),
          responseTimeMs
        })
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(data);
        if (data.is_correct) {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.65 } });
        }
        onSessionUpdated();
      }
    } catch (err) {
      console.error("Answer evaluation failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-xl max-h-[92vh] flex flex-col cosmic-card rounded-2xl border border-cyan-500/30 p-5 sm:p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <Zap className="w-4 h-4 text-cyan-400 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm">Targeted Practice Session</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  Target: ~70% Success Rate
                </span>
              </div>
              <span className="text-xs text-slate-400">
                {conceptInfo ? `${conceptInfo.name} (${conceptInfo.cluster})` : "Generating item…"}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-4">
          {isLoading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-400">Calibrating question difficulty to learner model…</p>
            </div>
          ) : question ? (
            <>
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                <p className="text-sm font-semibold text-slate-100 leading-relaxed">
                  {question.question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2">
                {question.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  let style = "border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 text-slate-300";

                  if (feedback) {
                    if (idx === question.correct_index) {
                      style = "border-emerald-500/70 bg-emerald-950/40 text-emerald-200 font-semibold";
                    } else if (isSelected && !feedback.is_correct) {
                      style = "border-rose-500/70 bg-rose-950/40 text-rose-200 font-semibold";
                    }
                  } else if (isSelected) {
                    style = "border-cyan-500 bg-cyan-950/50 text-white";
                  }

                  return (
                    <button
                      key={idx}
                      disabled={!!feedback || isSubmitting}
                      onClick={() => setSelectedOption(idx)}
                      className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-start gap-3 ${style}`}
                    >
                      <span className="w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center font-bold text-xs bg-slate-800/80">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="leading-relaxed">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Reasoning */}
              {!feedback && (
                <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1.5">
                  <label className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Why did you pick this? (Mandatory 1-line reason)</span>
                  </label>
                  <input
                    type="text"
                    value={reasoning}
                    onChange={(e) => setReasoning(e.target.value)}
                    placeholder="Explain your physical reasoning..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}

              {/* Feedback Drawer */}
              {feedback && (
                <div className="space-y-3 pt-2">
                  <div
                    className={`p-3.5 rounded-xl border ${
                      feedback.is_correct
                        ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-200"
                        : "bg-rose-950/50 border-rose-500/40 text-rose-200"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5 font-bold text-xs">
                      <div className="flex items-center gap-1.5">
                        {feedback.is_correct ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Correct Answer</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-rose-400" />
                            <span>Incorrect Answer</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/40 text-[11px] font-bold">
                        {feedback.bkt?.delta >= 0 ? (
                          <>
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-300">
                              +{(feedback.bkt?.delta * 100).toFixed(0)}% Mastery
                            </span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                            <span className="text-rose-300">
                              {(feedback.bkt?.delta * 100).toFixed(0)}% Mastery
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed opacity-90">{feedback.explanation}</p>
                  </div>

                  {feedback.detected_misconception && (
                    <div className="p-3.5 rounded-xl flare-card border border-rose-500/50 text-xs">
                      <span className="font-bold text-rose-300 block mb-1">
                        Active Solar Flare: {feedback.detected_misconception.name}
                      </span>
                      <p className="text-rose-200/90 leading-relaxed">
                        {feedback.detected_misconception.explanation}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Action Bottom */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end gap-3">
          {feedback ? (
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white transition-colors"
            >
              Done & Return to Sky
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={selectedOption === null || !reasoning.trim() || isSubmitting}
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 disabled:opacity-40 text-white shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? "Evaluating Reason…" : "Submit Answer"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
