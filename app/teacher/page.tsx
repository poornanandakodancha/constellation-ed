"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import {
  AlertTriangle,
  Sparkles,
  TrendingDown,
  ChevronRight,
  RotateCcw,
  FlaskConical,
  X,
  Bug
} from "lucide-react";
import conceptsData from "@/data/concepts.json";

// Distinct 2-line labels for all 29 concepts so no two columns look the same
const CONCEPT_SHORT_LABELS: Record<string, [string, string]> = {
  electric_charge: ["Electric", "Charge"],
  conductors_insulators: ["Cond. &", "Insul."],
  coulombs_law_concept: ["Coulomb", "Force"],
  electric_current: ["Current", "Def."],
  electric_circuit: ["Circuit", "Loop"],
  ammeter_measurement: ["Ammeter", "(Series)"],
  drift_velocity_electron_flow: ["Drift", "Velocity"],
  electric_potential: ["Potential", "Energy"],
  potential_difference: ["Voltage", "(V=W/Q)"],
  voltmeter_measurement: ["Voltmeter", "(Parallel)"],
  cell_and_emf: ["Cell &", "EMF"],
  ohms_law: ["Ohm's", "Law"],
  v_i_graph: ["V-I", "Slope"],
  electrical_resistance: ["Resistance", "Nature"],
  factors_affecting_resistance: ["Length /", "Area"],
  resistivity: ["Resistivity", "(ρ)"],
  temperature_dependence: ["Temp.", "Effect"],
  series_circuits: ["Series", "Current"],
  series_equivalent_resistance: ["Series", "Eq. R"],
  parallel_circuits: ["Parallel", "Voltage"],
  parallel_equivalent_resistance: ["Parallel", "Eq. R"],
  series_vs_parallel_comparison: ["Series vs", "Parallel"],
  joules_law_of_heating: ["Joule's", "Heating"],
  heating_applications: ["Heating", "Appl."],
  electric_energy_kwh: ["Energy", "(kWh)"],
  electric_power_formulas: ["Power", "Formulas"],
  bulb_power_ratings: ["Bulb", "Ratings"],
  electric_fuse_safety: ["Fuse", "Safety"],
  domestic_wiring_earthing: ["Earthing", "Safety"],
};

export default function TeacherPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConceptForHelp, setSelectedConceptForHelp] = useState<any | null>(null);
  const [selectedMisconceptionForHelp, setSelectedMisconceptionForHelp] = useState<any | null>(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/teacher/analytics");
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load teacher analytics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleReseed = async () => {
    if (!confirm("Reseed the 30 simulated students with realistic randomized distributions?")) return;
    setIsLoading(true);
    try {
      await fetch("/api/teacher/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reseed" })
      });
      await fetchAnalytics();
    } catch (err) {
      console.error("Reseed failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getHeatmapColor = (mastery: number | undefined, hasMisc: boolean) => {
    if (hasMisc) return "bg-rose-950 text-rose-200 border border-rose-500/70 shadow-[inset_0_0_8px_rgba(239,68,68,0.3)] font-black";
    if (mastery === undefined) return "bg-slate-900 text-slate-600";
    if (mastery >= 0.8) return "bg-emerald-600/80 text-white";
    if (mastery >= 0.6) return "bg-cyan-600/70 text-white";
    if (mastery >= 0.4) return "bg-amber-600/70 text-white";
    return "bg-rose-900/80 text-rose-200";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Header & Cohort Identification */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Teacher Diagnostic Hub: Class 10-A
              </h1>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Simulated Data Cohort (30 Students)
              </span>
            </div>
            <p className="text-xs text-slate-400">
              CBSE Physics Chapter: Electricity · Real-time Learner Model Cognitive Aggregation
            </p>
          </div>

          <button
            onClick={handleReseed}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Reseed 30 Students</span>
          </button>
        </div>

        {/* AI Suggested Lesson for Tomorrow */}
        {data?.suggested_lesson && (
          <div className="rounded-2xl cosmic-card p-6 border border-purple-500/30 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-purple-300">
                  AI-Generated Targeted Lesson Plan (For Tomorrow)
                </span>
              </div>
              <span className="text-xs font-bold text-slate-400">
                Duration: {data.suggested_lesson.duration_minutes || 45} mins
              </span>
            </div>

            <h2 className="text-lg font-black text-white mb-3">
              {data.suggested_lesson.title}
            </h2>

            {/* Core Objectives */}
            <div className="mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Target Remediation Objectives:
              </span>
              <ul className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {data.suggested_lesson.objectives?.map((obj: string, i: number) => (
                  <li
                    key={i}
                    className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-200 flex items-start gap-2"
                  >
                    <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-300 flex-shrink-0 flex items-center justify-center font-bold text-[10px]">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Live Counter-Intuitive Experiment Box */}
            {data.suggested_lesson.counter_experiment && (
              <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <FlaskConical className="w-4 h-4 text-purple-300" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-200">
                    Recommended In-Class Counter-Experiment: &ldquo;{data.suggested_lesson.counter_experiment.title}&rdquo;
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-bold text-slate-400 block mb-1">Demonstration Steps:</span>
                    <ol className="list-decimal list-inside space-y-1 text-slate-300">
                      {data.suggested_lesson.counter_experiment.steps?.map((step: string, idx: number) => (
                        <li key={idx} className="leading-relaxed">{step}</li>
                      ))}
                    </ol>
                  </div>

                  <div>
                    <span className="font-bold text-amber-400 block mb-1">💡 Expected Student &ldquo;Aha!&rdquo; Moment:</span>
                    <p className="text-slate-300 leading-relaxed italic bg-black/40 p-2.5 rounded-lg border border-purple-500/20">
                      &ldquo;{data.suggested_lesson.counter_experiment.expected_aha_moment}&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Key Questions to Ask Class */}
            {data.suggested_lesson.key_questions_to_ask_class && (
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Probing Questions to Prompt Classroom Discourse:
                </span>
                <div className="flex flex-wrap gap-2">
                  {data.suggested_lesson.key_questions_to_ask_class.map((q: string, i: number) => (
                    <span
                      key={i}
                      className="text-xs px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
                    >
                      ❓ &ldquo;{q}&rdquo;
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dual Leaderboards: Ranked Gaps & Shared Misconceptions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Class-Wide Conceptual Gaps */}
          <div className="rounded-2xl cosmic-card p-5 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
                  Ranked Class Gaps (Lowest Mastery First)
                </h3>
              </div>
              <span className="text-xs text-slate-400">Click concept to inspect students</span>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {data?.ranked_gaps?.slice(0, 10).map((gap: any, idx: number) => (
                <div
                  key={gap.concept_id}
                  onClick={() => setSelectedConceptForHelp(gap)}
                  className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex-1 mr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                        {gap.name}
                      </span>
                      <span className="text-[10px] text-slate-400">({gap.cluster})</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          gap.avg_mastery < 0.4
                            ? "bg-rose-500"
                            : gap.avg_mastery < 0.65
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${gap.avg_mastery * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-extrabold text-white block">
                      {(gap.avg_mastery * 100).toFixed(0)}% avg
                    </span>
                    <span className="text-[10px] text-rose-400 font-semibold block">
                      {gap.struggling_count} students need help
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Top Shared Misconceptions */}
          <div className="rounded-2xl cosmic-card p-5 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-rose-300">
                  Top Shared Mental Model Misconceptions
                </h3>
              </div>
              <span className="text-xs text-slate-400">Aggregated from typed reasoning</span>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {data?.top_misconceptions?.map((misc: any) => (
                <div
                  key={misc.id}
                  onClick={() => setSelectedMisconceptionForHelp(misc)}
                  className="p-3.5 rounded-xl flare-card border border-rose-500/30 hover:border-rose-500/60 cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h4 className="text-xs font-bold text-white leading-snug">
                        &ldquo;{misc.name}&rdquo;
                      </h4>
                      <p className="text-[11px] text-rose-300/80 mt-0.5">
                        Typical wrong belief: &ldquo;{misc.typical_belief}&rdquo;
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-sm font-black text-rose-400">
                        {misc.count} of 30
                      </span>
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        ({misc.percentage}% of class)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-rose-500/20 text-[10px] text-rose-300">
                    <span>Click to see {misc.count} affected students</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Heatmap Matrix: Students x Concepts */}
        <div className="rounded-2xl cosmic-card p-5 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
                Class Cognitive Heatmap: 30 Students × 29 Concepts
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Cell colors denote BKT mastery probability P(L). Cells with a bug icon highlight active misconceptions.
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center flex-wrap gap-3 text-[11px]">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-emerald-600" />
                <span className="text-slate-300">Mastered (&gt;80%)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-cyan-600" />
                <span className="text-slate-300">Competent (60-80%)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-amber-600" />
                <span className="text-slate-300">Learning (40-60%)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-rose-900" />
                <span className="text-slate-300">Gaps (&lt;40%)</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-950/80 border border-rose-500/50">
                <Bug className="w-3 h-3 text-rose-400" />
                <span className="text-rose-300 font-bold">Active Bug</span>
              </div>
            </div>
          </div>

          {/* Sticky Scrollable Matrix Container */}
          <div className="overflow-auto max-h-[620px] border border-slate-800 rounded-xl relative shadow-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-slate-700">
                  {/* Sticky Top-Left Corner Cell: Student Name */}
                  <th className="p-3 sticky top-0 left-0 bg-slate-950 z-30 min-w-[160px] max-w-[170px] border-r-2 border-slate-700 shadow-[2px_2px_10px_rgba(0,0,0,0.6)] text-xs font-black text-slate-200 tracking-wider">
                    Student Name
                  </th>

                  {/* Sticky Top-Left Second Cell: Overall Mastery */}
                  <th className="p-3 sticky top-0 left-[160px] bg-slate-950 z-30 min-w-[74px] border-r-2 border-slate-700 text-center shadow-[2px_2px_10px_rgba(0,0,0,0.6)] text-xs font-black text-cyan-400 tracking-wider">
                    Overall
                  </th>

                  {/* Sticky Header Row: All 29 Concept Columns with distinct 2-line labels */}
                  {conceptsData.map((concept) => {
                    const labels = CONCEPT_SHORT_LABELS[concept.id] || [concept.id.slice(0, 6), ""];
                    return (
                      <th
                        key={concept.id}
                        title={`${concept.name} (${concept.cluster})\nDifficulty: ${concept.difficulty}/5\n${concept.short_explanation}`}
                        className="sticky top-0 bg-slate-950 z-20 p-2 text-center border-r border-slate-800 min-w-[74px] max-w-[90px] shadow-[0_2px_10px_rgba(0,0,0,0.5)] cursor-help hover:bg-slate-900 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center leading-tight">
                          <span className="text-[10px] font-extrabold text-slate-200 tracking-tight">
                            {labels[0]}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 tracking-tight">
                            {labels[1]}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {data?.heatmap?.map((row: any) => (
                  <tr
                    key={row.student_id}
                    className="border-b border-slate-900/60 hover:bg-slate-900/40 group transition-colors"
                  >
                    {/* Sticky Left Column: Student Name */}
                    <td className="p-2.5 sticky left-0 bg-slate-950 z-10 font-bold text-slate-200 border-r-2 border-slate-800 text-xs shadow-[2px_0_10px_rgba(0,0,0,0.4)] group-hover:bg-slate-900 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />
                        <span className="truncate max-w-[125px]">{row.name}</span>
                      </div>
                    </td>

                    {/* Sticky Left Column 2: Overall Mastery */}
                    <td className="p-2 sticky left-[160px] bg-slate-950 z-10 text-center font-black text-cyan-400 border-r-2 border-slate-800 text-xs shadow-[2px_0_10px_rgba(0,0,0,0.4)] group-hover:bg-slate-900 transition-colors">
                      {(row.overall_mastery * 100).toFixed(0)}%
                    </td>

                    {/* Concept Mastery Cells */}
                    {conceptsData.map((concept) => {
                      const mastery = row.masteries[concept.id];
                      const misc = row.active_misconceptions?.[concept.id];
                      const hasMisc = !!misc;

                      const tooltip = hasMisc
                        ? `${row.name} - ${concept.name}: ${(mastery * 100).toFixed(0)}% mastery\n🚨 Active Mental Bug: "${misc.name}"\n${misc.evidence}`
                        : `${row.name} - ${concept.name}: ${
                            mastery !== undefined ? (mastery * 100).toFixed(0) + "%" : "N/A"
                          }`;

                      return (
                        <td
                          key={concept.id}
                          title={tooltip}
                          className={`p-1.5 text-center border-r border-b border-slate-900/80 text-[10px] min-w-[74px] transition-transform hover:scale-105 cursor-pointer ${getHeatmapColor(
                            mastery,
                            hasMisc
                          )}`}
                        >
                          <div className="flex items-center justify-center gap-1 font-bold">
                            {hasMisc && (
                              <Bug className="w-3 h-3 text-rose-300 flex-shrink-0 animate-pulse" />
                            )}
                            <span>{mastery !== undefined ? (mastery * 100).toFixed(0) : "-"}</span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Drill-down Modal: Concept Help List */}
      {selectedConceptForHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg cosmic-card rounded-2xl border border-indigo-500/40 p-6 shadow-2xl relative">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  Concept Intervention Drill-down
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  {selectedConceptForHelp.name}
                </h3>
                <span className="text-xs text-rose-400 font-semibold">
                  {selectedConceptForHelp.struggling_students?.length || 0} students below 50% mastery
                </span>
              </div>
              <button
                onClick={() => setSelectedConceptForHelp(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 mb-4 pr-1">
              {selectedConceptForHelp.struggling_students?.map((s: any) => (
                <div
                  key={s.id}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <span className="font-bold text-white">{s.name}</span>
                  <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-extrabold border border-rose-500/30">
                    {(s.mastery * 100).toFixed(0)}% Mastery
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedConceptForHelp(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              Close Drill-down
            </button>
          </div>
        </div>
      )}

      {/* Drill-down Modal: Misconception Affected Students */}
      {selectedMisconceptionForHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg flare-card rounded-2xl border border-rose-500/50 p-6 shadow-2xl relative">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  Shared Misconception Roster
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  &ldquo;{selectedMisconceptionForHelp.name}&rdquo;
                </h3>
                <span className="text-xs text-rose-300 font-semibold">
                  Held by {selectedMisconceptionForHelp.affected_students?.length || 0} of 30 students
                </span>
              </div>
              <button
                onClick={() => setSelectedMisconceptionForHelp(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-rose-500/30 text-xs text-rose-200 mb-4">
              <span className="font-bold block mb-1">Common Fallacy in Reasoning:</span>
              &ldquo;{selectedMisconceptionForHelp.typical_belief}&rdquo;
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5 mb-4 pr-1">
              {selectedMisconceptionForHelp.affected_students?.map((s: any) => (
                <div
                  key={s.id}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white flex items-center justify-between"
                >
                  <span className="font-medium">{s.name}</span>
                  <span className="text-[10px] text-rose-400 font-bold">Needs Counter-Example</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedMisconceptionForHelp(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              Close Roster
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
