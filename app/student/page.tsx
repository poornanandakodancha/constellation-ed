"use client";

import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { ConstellationCanvas, ConstellationConcept } from "@/components/ConstellationCanvas";
import { PredictedScoreGauge } from "@/components/PredictedScoreGauge";
import { KnowledgeTwinPanel } from "@/components/KnowledgeTwinPanel";
import { StarInspectorDrawer } from "@/components/StarInspectorDrawer";
import { MisconceptionCards } from "@/components/MisconceptionCards";
import { CounterExampleModal } from "@/components/CounterExampleModal";
import { DiagnosticModal } from "@/components/DiagnosticModal";
import { PracticeModal } from "@/components/PracticeModal";
import { ConstellationStoryModal, ConstellationStoryData } from "@/components/ConstellationStoryModal";
import { Misconception, MisconceptionLog } from "@/types";
import { Clock, Sparkles, ArrowRight } from "lucide-react";

export default function StudentPage() {
  const [concepts, setConcepts] = useState<ConstellationConcept[]>([]);
  const [activeMisconceptions, setActiveMisconceptions] = useState<MisconceptionLog[]>([]);
  const [predictedScore, setPredictedScore] = useState<any>(null);
  const [todayQueue, setTodayQueue] = useState<any[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<ConstellationConcept | null>(null);

  // Modals state
  const [activeCounterExample, setActiveCounterExample] = useState<Misconception | null>(null);
  const [diagnosticOpen, setDiagnosticOpen] = useState(false);
  const [practiceConceptId, setPracticeConceptId] = useState<string | null>(null);
  const [storyModalOpen, setStoryModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSessionData = useCallback(async () => {
    try {
      const res = await fetch("/api/student/session-queue?studentId=student_demo");
      const data = await res.json();
      if (data.success) {
        setConcepts(data.concepts);
        setActiveMisconceptions(data.active_misconceptions);
        setPredictedScore(data.predicted_exam_score);
        setTodayQueue(data.today_queue || []);

        // Refresh selected concept if open
        if (selectedConcept) {
          const updated = data.concepts.find(
            (c: ConstellationConcept) => c.concept_id === selectedConcept.concept_id
          );
          if (updated) setSelectedConcept(updated);
        }
      }
    } catch (err) {
      console.error("Failed to fetch student session queue:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedConcept]);

  useEffect(() => {
    fetchSessionData();
  }, []);

  const handleFastForwardDemo = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/demo/fast-forward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: "student_demo" })
      });
      const data = await res.json();
      if (data.success) {
        await fetchSessionData();
      }
    } catch (err) {
      console.error("Demo fast-forward failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetStudent = async () => {
    if (!confirm("Reset your learning model progress to prior state?")) return;
    setIsLoading(true);
    try {
      await fetch("/api/diagnostic/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: "student_demo" })
      });
      await fetchSessionData();
    } catch (err) {
      console.error("Reset failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const starsLitCount = Math.max(6, concepts.filter((c) => c.p_mastery >= 0.7).length);
  const starsNeedReviewCount = todayQueue.length > 0 ? todayQueue.length : 3;

  const currentConstellationStory: ConstellationStoryData = {
    starsLitCount,
    bugsFixedCount: 1,
    starsNeedReviewCount,
    examScoreGain: 18,
    storyNarrative: `Tonight across your Class 10 sector, you lit ${starsLitCount} stars as your mental model forged conceptual bridges between current, resistance, and Ohm's law. 1 persistent bug ("Current is Consumed") is flagged for counter-example repair, and ${starsNeedReviewCount} stars are scheduled for review tomorrow to beat the Ebbinghaus forgetting curve.`,
    starsDetails: concepts
      .filter((c) => c.p_mastery >= 0.6)
      .slice(0, 5)
      .map((c) => ({
        name: c.name,
        oldP: Math.max(0.2, c.p_mastery - 0.25),
        newP: c.p_mastery
      }))
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar
        onFastForwardDemo={handleFastForwardDemo}
        onResetStudent={handleResetStudent}
        isLoading={isLoading}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top HUD: Live Predicted Score Gauge & Session Launcher */}
        <PredictedScoreGauge
          scoreData={predictedScore}
          onStartSession={() => setDiagnosticOpen(true)}
          isLoading={isLoading}
        />

        {/* Feature 3: Knowledge Twin Panel (Now vs 7 Days Spaced-Repetition Plan) */}
        <KnowledgeTwinPanel
          scoreData={predictedScore}
          todayQueueCount={todayQueue.length || 3}
          onStartReview={() => {
            if (todayQueue.length > 0) {
              setPracticeConceptId(todayQueue[0].concept_id);
            } else {
              setDiagnosticOpen(true);
            }
          }}
        />

        {/* Feature 4: Constellation Story Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-purple-950/40 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-amber-300 animate-spin" style={{ animationDuration: "12s" }} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-500/25 text-indigo-300 border border-indigo-500/40">
                  Constellation Story
                </span>
                <span className="text-xs font-black text-white">
                  &ldquo;You lit {starsLitCount} stars, fixed 1 bug, and {starsNeedReviewCount} stars need review tomorrow.&rdquo;
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Your cognitive celestial sector is expanding. Check tomorrow to preserve your star brightness against forgetting decay.
              </p>
            </div>
          </div>

          <button
            onClick={() => setStoryModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 transition-all flex items-center gap-1.5 self-end sm:self-auto flex-shrink-0 shadow-md"
          >
            <span>Read Story</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Feature 1: Constellation Starry Sky (with Shooting-Star & Soft Glow Pulse) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-200">
                Cosmic Knowledge Constellation
              </h2>
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">
              Click any star node to inspect concept mastery or launch targeted practice
            </span>
          </div>

          <ConstellationCanvas
            concepts={concepts}
            onSelectConcept={(c) => setSelectedConcept(c)}
            selectedConceptId={selectedConcept?.concept_id}
          />
        </div>

        {/* Feature 2: Misconception Autopsy & Spaced Repetition Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {/* Left 2 Cols: Misconception Autopsy Cards */}
          <div className="lg:col-span-2">
            <MisconceptionCards
              logs={activeMisconceptions}
              onOpenCounterExample={(m) => setActiveCounterExample(m)}
            />
          </div>

          {/* Right Col: Today's Spaced Repetition Queue */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-amber-300">
                  Today&apos;s Review Queue ({todayQueue.length})
                </h3>
              </div>
              <span className="text-xs text-slate-400">SM-2 Scheduled</span>
            </div>

            <div className="rounded-2xl cosmic-card p-4 border border-slate-800 space-y-2.5">
              {todayQueue.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  All concepts refreshed! Check back tomorrow for retention decay reviews.
                </p>
              ) : (
                todayQueue.map((item) => (
                  <div
                    key={item.concept_id}
                    onClick={() => setPracticeConceptId(item.concept_id)}
                    className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            item.is_due ? "bg-amber-400 animate-pulse" : "bg-cyan-400"
                          }`}
                        />
                        <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        {item.is_due
                          ? "Forgetting curve decay: Due for review"
                          : `Calibrated focus · Mastery ${(item.p_mastery * 100).toFixed(0)}%`}
                      </span>
                    </div>

                    <span className="text-[11px] font-bold px-2 py-1 rounded bg-slate-800 group-hover:bg-cyan-500/20 group-hover:text-cyan-300 text-slate-300 transition-colors">
                      Review →
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Interactive Star Inspector Drawer */}
      <StarInspectorDrawer
        concept={selectedConcept}
        onClose={() => setSelectedConcept(null)}
        onPracticeConcept={(conceptId) => {
          setSelectedConcept(null);
          setPracticeConceptId(conceptId);
        }}
        isLoading={isLoading}
      />

      {/* Counter-Example Challenge Modal */}
      <CounterExampleModal
        misconception={activeCounterExample}
        onClose={() => setActiveCounterExample(null)}
        onResolved={() => {
          fetchSessionData();
          setTimeout(() => setActiveCounterExample(null), 1800);
        }}
      />

      {/* Adaptive Diagnostic Session Modal */}
      <DiagnosticModal
        isOpen={diagnosticOpen}
        onClose={() => {
          setDiagnosticOpen(false);
          fetchSessionData();
        }}
        onSessionUpdated={fetchSessionData}
      />

      {/* Single Concept Practice Modal */}
      <PracticeModal
        conceptId={practiceConceptId}
        isOpen={!!practiceConceptId}
        onClose={() => {
          setPracticeConceptId(null);
          fetchSessionData();
        }}
        onSessionUpdated={fetchSessionData}
      />

      {/* Constellation Story Modal */}
      <ConstellationStoryModal
        isOpen={storyModalOpen}
        onClose={() => setStoryModalOpen(false)}
        story={currentConstellationStory}
      />
    </div>
  );
}
