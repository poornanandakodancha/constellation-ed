"use client";

import { Sparkles, CheckCircle2, ArrowRight, Activity, Eye, Zap, AlertCircle } from "lucide-react";
import { Misconception, MisconceptionLog } from "@/types";
import misconceptionsData from "@/data/misconceptions.json";

interface MisconceptionCardsProps {
  logs: MisconceptionLog[];
  onOpenCounterExample: (misconception: Misconception) => void;
}

// Curated 1-line mental model diagrams contrasting flawed mental bugs with physical reality
const MENTAL_MODEL_DIAGRAMS: Record<string, { buggy: string; reality: string }> = {
  curr_used_up: {
    buggy: "Battery (+) ──(0.5A)──> [💡 Lamp 'Consumes' Current] ──(0.2A)──> Battery (-)",
    reality: "Battery (+) ──(0.5A)──> [💡 Lamp Drops Voltage] ──(0.5A Conserved)──> Battery (-)"
  },
  battery_const_curr: {
    buggy: "[9V Battery] ───(Always delivers fixed 2.0A regardless of circuit)───> [Load]",
    reality: "[9V Battery] ───(Maintains 9V; Current adapts to load resistance I = V/R)───> [Load]"
  },
  higher_res_more_curr: {
    buggy: "[Source V] ──> [High Resistor R (demands more effort)] ──> [Draws MORE Current I]",
    reality: "[Source V] ──> [High Resistor R (opposes charge flow)] ──> [Permits LESS Current I]"
  },
  series_parallel_same_bright: {
    buggy: "Series (2 Bulbs) Brightness  ===  Parallel (2 Bulbs) Brightness",
    reality: "Series Bulbs (P = V²/4R, Dim)  <<<  Parallel Bulbs (P = V²/R each, Full Brightness)"
  },
  parallel_res_adds: {
    buggy: "Add 10Ω parallel to 10Ω  ──>  Total Resistance = 20Ω (More resistors = more total)",
    reality: "Add 10Ω parallel to 10Ω  ──>  Total Resistance = 5Ω (Extra lane = half resistance)"
  },
  electron_speed_light: {
    buggy: "Flip switch ──> Individual electron races down 100m wire at 300,000 km/s ──> Bulb turns on",
    reality: "Flip switch ──> Electric field establishes at ~c; Electrons drift sluggishly at ~0.1 mm/s"
  },
  voltmeter_in_series: {
    buggy: "Battery ──[Voltmeter in Series (10 MΩ)]──> Bulb (Expects to measure voltage across bulb)",
    reality: "Battery ──[Bulb]──> Return  (Voltmeter connects in PARALLEL across the two terminals)"
  },
  ammeter_in_parallel: {
    buggy: "Battery ──> Bulb (Ammeter placed in parallel across bulb terminals)",
    reality: "Ammeter has near 0Ω resistance; parallel connection causes a catastrophic DEAD SHORT!"
  },
  voltage_equals_current: {
    buggy: "Voltage (V) == Current (I)  (Treated as interchangeable terms for 'electrical juice')",
    reality: "Voltage = Electrical Push (Joules / Coulomb)  vs  Current = Charge Flow Rate (Coulombs / sec)"
  },
  thicker_wire_more_res: {
    buggy: "Thicker wire has more copper atoms ──> Electrons hit more obstacles ──> Higher Resistance",
    reality: "Thicker wire has wider cross-section A (R = ρL/A) ──> Wider highway = Lower Resistance"
  },
  longer_wire_less_res: {
    buggy: "Longer wire gives more room for electrons to spread out ──> Lower Resistance",
    reality: "Longer wire means more continuous lattice collisions (R ∝ Length L) ──> Higher Resistance"
  },
  fuse_in_neutral: {
    buggy: "Fuse placed in Neutral blows ──> Circuit opens ──> Appliance safe to touch inside",
    reality: "Fuse in Neutral blows, but Live wire (220V) stays connected! Severe electrocution hazard!"
  },
  neutral_wire_no_current: {
    buggy: "Live wire carries incoming current; Neutral wire carries 0A (it's 'neutral / dead')",
    reality: "Live and Neutral carry identical alternating current; Neutral is merely grounded at the pole."
  },
  earthing_consumes_power: {
    buggy: "Earth wire continuously drains electricity into the ground, raising household power bills",
    reality: "Earth wire conducts ZERO current during normal operation; it is purely an emergency escape route."
  }
};

// Rich narrative vignette: why everyday intuition tricks the human brain
const AUTOPSY_STORIES: Record<string, string> = {
  curr_used_up:
    "From early childhood, our brains witness consumable resource dynamics: cars consume gasoline to move, campfires burn up wood to produce warmth, and water drains out of a garden hose. When you watch a tungsten bulb radiate intense light and heat, your brain's intuitive physics engine automatically creates a story: 'The lamp must be eating up the electricity!' In physics, however, electric current is an incompressible fluid of charge carriers. Charge is strictly conserved: every single electron entering the filament must leave on the return wire. It is electrical potential energy that transforms, not charge.",
  battery_const_curr:
    "Batteries are labeled with static physical ratings like '1.5V' or '9V', and consumer electronics talk about '3000 mAh' capacity. Because batteries look and feel like closed containers of power, our intuition models them as constant-displacement water pumps that expel a fixed volume every second regardless of the pipe size. But a chemical cell maintains a potential difference (voltage), not current! The current is negotiated on-the-fly by the connected load's resistance: I = V / R.",
  higher_res_more_curr:
    "In everyday human language, 'greater resistance' implies a heavyweight task or greater struggle (like lifting a heavier barbell), which demands more physical effort. Students intuitively translate this into: 'A bigger resistor does more work, so it must pull more current from the battery.' In electrical reality, resistance is literal opposition: higher resistance chokes the flow of electrons, reducing current under constant voltage.",
  series_parallel_same_bright:
    "Visual symmetry creates a cognitive trap: if you connect two identical 60W bulbs to a 12V battery, common sense suggests the bulbs should look identical regardless of wiring. But in series, the two bulbs share the 12V (6V each, producing 1/4 the power), whereas in parallel, both bulbs receive the full 12V across their individual loops, shining 4 times brighter!"
};

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
          <Activity className="w-4 h-4 text-rose-400 animate-pulse" />
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-rose-300">
            Misconception Autopsy: Deconstructing Mental Bugs ({activeLogs.length})
          </h3>
        </div>
        <span className="text-xs text-slate-400">
          Diagnosed from your typed reasoning
        </span>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {activeLogs.map((log) => {
          const misc = (misconceptionsData as Misconception[]).find(
            (m) => m.id === log.misconception_id
          );
          if (!misc) return null;

          const diagram = MENTAL_MODEL_DIAGRAMS[misc.id] || {
            buggy: `Flawed Intuition: ${misc.typical_belief}`,
            reality: `Physical Reality: ${misc.scientific_truth}`
          };

          const autopsyStory =
            AUTOPSY_STORIES[misc.id] ||
            `Everyday experiences often mislead our cognitive models. While "${misc.typical_belief}" feels intuitive based on macro analogies, electrical systems obey exact conservation and field equations: ${misc.scientific_truth}`;

          return (
            <div
              key={log.id}
              className="rounded-2xl flare-card p-5 sm:p-6 border border-rose-500/40 shadow-2xl relative overflow-hidden group space-y-4"
            >
              {/* Radial red glow overlay */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Header Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-500/25 text-rose-200 border border-rose-500/50 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                    Cognitive Bug Autopsy
                  </span>
                  <span className="text-xs font-bold text-slate-300">
                    Concept: <span className="text-cyan-300 uppercase">{misc.concept_id.replace(/_/g, " ")}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-300 font-semibold">
                    Confidence: {(log.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Title & Student Reasoning Evidence */}
              <div>
                <h4 className="text-lg font-black text-white mb-2 leading-tight flex items-center gap-2">
                  <span>Bug Diagnosed: &ldquo;{misc.name}&rdquo;</span>
                </h4>

                {log.reasoning_evidence && (
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-rose-500/30 text-xs text-rose-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block mb-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Extracted Evidence From Your Typed Reasoning:
                    </span>
                    <p className="italic font-medium">&ldquo;{log.reasoning_evidence}&rdquo;</p>
                  </div>
                )}
              </div>

              {/* Autopsy Section 1: The Intuition Story (Why it feels true) */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-amber-400">
                  <Eye className="w-3.5 h-3.5" />
                  <span>The Cognitive Autopsy: Why this intuition feels so true</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {autopsyStory}
                </p>
              </div>

              {/* Autopsy Section 2: One-Line Mental Model Diagram */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Mental Model Collision Diagram
                </span>
                <div className="space-y-1.5 font-mono text-[11px] sm:text-xs">
                  {/* Buggy Model Track */}
                  <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 overflow-x-auto whitespace-nowrap">
                    <span className="font-bold text-rose-400 mr-2">❌ Your Buggy Model:</span>
                    <span>{diagram.buggy}</span>
                  </div>
                  {/* Physical Reality Track */}
                  <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 overflow-x-auto whitespace-nowrap">
                    <span className="font-bold text-emerald-400 mr-2">✅ Physical Reality:</span>
                    <span>{diagram.reality}</span>
                  </div>
                </div>
              </div>

              {/* Autopsy Section 3: Counter-Example Thought Experiment Preview */}
              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-300 block flex items-center gap-1">
                    <Zap className="w-3 h-3 text-cyan-400" />
                    Prescribed Cognitive Counter-Example Challenge:
                  </span>
                  <p className="text-xs font-semibold text-slate-200 line-clamp-2">
                    {misc.counter_example_question.question}
                  </p>
                </div>

                <button
                  onClick={() => onOpenCounterExample(misc)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all flex-shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: "6s" }} />
                  <span>Solve Counter-Example &amp; Fix</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
