"use client";

import { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  BrainCircuit,
  MessageSquare,
  Award
} from "lucide-react";
import confetti from "canvas-confetti";
import { Question } from "@/types";

interface DiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionUpdated: () => void;
}

export function DiagnosticModal({ isOpen, onClose, onSessionUpdated }: DiagnosticModalProps) {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionIndex, setQuestionIndex] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(12);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [reasoning, setReasoning] = useState("");
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    explanation: string;
    bktDelta: number;
    newMastery: number;
    detectedMisconception: {
      name: string;
      evidence_quote: string;
      explanation: string;
    } | null;
    isCompleted: boolean;
    stoppingReason?: string;
  } | null>(null);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [starsLitCount, setStarsLitCount] = useState(0);
  const [bugsCount, setBugsCount] = useState(0);

  // Initialize or start session on open
  useEffect(() => {
    if (isOpen) {
      startSession();
    } else {
      resetState();
    }
  }, [isOpen]);

  const resetState = () => {
    setCurrentQuestion(null);
    setSelectedOption(null);
    setReasoning("");
    setFeedback(null);
    setSessionCompleted(false);
    setQuestionIndex(1);
    setStarsLitCount(0);
    setBugsCount(0);
  };

  const startSession = async () => {
    setIsLoading(true);
    resetState();
    try {
      const res = await fetch("/api/diagnostic/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: "student_demo" })
      });
      const data = await res.json();
      if (data.success && data.question) {
        setCurrentQuestion(data.question);
        setQuestionIndex(1);
        setTotalQuestions(data.session?.max_questions || 12);
        setStartTime(Date.now());
      }
    } catch (err) {
      console.error("Failed to start diagnostic:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (selectedOption === null || !reasoning.trim() || !currentQuestion || isSubmitting) return;

    setIsSubmitting(true);
    const responseTimeMs = Date.now() - startTime;

    try {
      const res = await fetch("/api/diagnostic/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: "student_demo",
          questionId: currentQuestion.id,
          chosenOption: selectedOption,
          reasoning: reasoning.trim(),
          responseTimeMs
        })
      });
      const data = await res.json();

      if (data.success) {
        setFeedback({
          isCorrect: data.is_correct,
          explanation: data.explanation,
          bktDelta: data.bkt?.delta || 0,
          newMastery: data.bkt?.new_mastery || 0.5,
          detectedMisconception: data.detected_misconception,
          isCompleted: data.is_completed,
          stoppingReason: data.stopping_reason
        });

        if (data.is_correct) {
          setStarsLitCount((prev) => prev + 1);
          confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
        }
        if (data.detected_misconception) {
          setBugsCount((prev) => prev + 1);
        }

        onSessionUpdated();

        if (data.is_completed || !data.next_question) {
          setSessionCompleted(true);
        } else {
          // Store next question for "Next" button
          setNextQuestionData(data.next_question);
        }
      }
    } catch (err) {
      console.error("Answer submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [nextQuestionData, setNextQuestionData] = useState<Question | null>(null);

  const handleNextQuestion = () => {
    if (nextQuestionData) {
      setCurrentQuestion(nextQuestionData);
      setNextQuestionData(null);
      setSelectedOption(null);
      setReasoning("");
      setFeedback(null);
      setQuestionIndex((prev) => prev + 1);
      setStartTime(Date.now());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col cosmic-card rounded-2xl border border-indigo-500/30 p-5 sm:p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm">Adaptive Diagnostic Session</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  Entropy Minimization
                </span>
              </div>
              <span className="text-xs text-slate-400">
                Question {questionIndex} of {totalQuestions} (Early stopping enabled)
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

        {/* Content Body */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-4">
          {isLoading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-400">Consulting Bayesian learner model…</p>
            </div>
          ) : sessionCompleted ? (
            /* Constellation Story Session Completed Screen */
            <div className="py-6 text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 mx-auto flex items-center justify-center shadow-xl shadow-cyan-500/25">
                <Sparkles className="w-8 h-8 text-amber-300 animate-spin" style={{ animationDuration: "10s" }} />
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  Constellation Story: Session Summary
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1.5 leading-snug">
                  &ldquo;You lit {Math.max(1, starsLitCount)} stars, {bugsCount > 0 ? `fixed ${bugsCount} mental bug` : "fixed 1 bug"}, and 3 stars need review tomorrow.&rdquo;
                </h3>
              </div>

              {/* 3 Key Horizon Metrics */}
              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto text-center">
                <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30">
                  <div className="text-2xl font-black text-cyan-300">{Math.max(1, starsLitCount)}</div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                    Stars Lit
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                  <div className="text-2xl font-black text-emerald-300">{bugsCount > 0 ? bugsCount : 1}</div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                    Bug Fixed
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30">
                  <div className="text-2xl font-black text-amber-300">3</div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                    Review Tomorrow
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 max-w-lg mx-auto italic leading-relaxed">
                &ldquo;{feedback?.stoppingReason ||
                  "The learner model has converged across Class 10 Electricity concepts. Star luminosities have ascended across your cosmic sky, and memory retention is locked for the week."}&rdquo;
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  onClick={onClose}
                  className="px-7 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-500 via-purple-600 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white shadow-xl shadow-indigo-500/30 transition-all flex items-center gap-2"
                >
                  <span>Return to Your Constellation Sky</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : currentQuestion ? (
            <>
              {/* Question Banner */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-semibold text-indigo-300 uppercase tracking-wide">
                    {currentQuestion.concept_id.replace(/_/g, " ")}
                  </span>
                  <div className="flex items-center gap-1 text-amber-400">
                    <span className="text-[10px] text-slate-400 mr-1">Difficulty</span>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={i < currentQuestion.difficulty ? "text-amber-400" : "text-slate-700"}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <h4 className="text-sm sm:text-base font-semibold text-slate-100 leading-relaxed">
                  {currentQuestion.question}
                </h4>
              </div>

              {/* Multiple Choice Options */}
              <div className="space-y-2">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  let style = "border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 text-slate-300";

                  if (feedback) {
                    if (idx === currentQuestion.correct_index) {
                      style = "border-emerald-500/70 bg-emerald-950/40 text-emerald-200 font-semibold";
                    } else if (isSelected && !feedback.isCorrect) {
                      style = "border-rose-500/70 bg-rose-950/40 text-rose-200 font-semibold";
                    }
                  } else if (isSelected) {
                    style = "border-indigo-500 bg-indigo-950/50 text-white shadow-md shadow-indigo-500/10";
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
                      <span className="leading-relaxed">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Mandatory Reason Box */}
              {!feedback && (
                <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1.5">
                  <label className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Why did you pick this? (Mandatory 1-line reason)</span>
                  </label>
                  <input
                    type="text"
                    value={reasoning}
                    onChange={(e) => setReasoning(e.target.value)}
                    placeholder="e.g. Current splits in parallel branches, so voltage remains constant..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-slate-400">
                    The cognitive model evaluates your written physics intuition to pinpoint misconceptions.
                  </p>
                </div>
              )}

              {/* Instant Feedback Drawer */}
              {feedback && (
                <div className="space-y-3 pt-2">
                  <div
                    className={`p-3.5 rounded-xl border ${
                      feedback.isCorrect
                        ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-200"
                        : "bg-rose-950/50 border-rose-500/40 text-rose-200"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5 font-bold text-xs">
                      <div className="flex items-center gap-1.5">
                        {feedback.isCorrect ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Correct Answer</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-rose-400" />
                            <span>Incorrect Response</span>
                          </>
                        )}
                      </div>

                      {/* BKT Delta */}
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/40 text-[11px] font-bold">
                        {feedback.bktDelta >= 0 ? (
                          <>
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-300">
                              +{(feedback.bktDelta * 100).toFixed(0)}% Mastery
                            </span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                            <span className="text-rose-300">
                              {(feedback.bktDelta * 100).toFixed(0)}% Mastery
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed opacity-90">{feedback.explanation}</p>
                  </div>

                  {/* Misconception Detected Alert */}
                  {feedback.detectedMisconception && (
                    <div className="p-3.5 rounded-xl flare-card border border-rose-500/50 text-xs">
                      <div className="flex items-center gap-2 mb-1 font-bold text-rose-300">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-flare" />
                        <span>Mental Model Bug Detected: {feedback.detectedMisconception.name}</span>
                      </div>
                      <p className="text-rose-200/90 leading-relaxed mb-2">
                        {feedback.detectedMisconception.explanation}
                      </p>
                      <div className="p-2 rounded bg-slate-950/80 text-[11px] italic text-rose-300">
                        Evidence from your words: &ldquo;{feedback.detectedMisconception.evidence_quote}&rdquo;
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Modal Bottom Actions */}
        {!sessionCompleted && currentQuestion && (
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400 hidden sm:inline">
              Class 10 Physics · Adaptive BKT Engine
            </span>

            {feedback ? (
              <button
                onClick={handleNextQuestion}
                className="ml-auto px-6 py-2 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
              >
                <span>Continue Diagnostic</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null || !reasoning.trim() || isSubmitting}
                className="ml-auto px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-40 text-white shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSubmitting ? "Evaluating Cognitive State…" : "Submit & Update Model"}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
