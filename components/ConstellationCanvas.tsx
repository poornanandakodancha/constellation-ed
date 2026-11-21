"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { ZoomIn, ZoomOut, Maximize2, Sparkles } from "lucide-react";

export interface ConstellationConcept {
  concept_id: string;
  name: string;
  cluster: string;
  prerequisites: string[];
  difficulty: number;
  short_explanation: string;
  x_hint?: number;
  y_hint?: number;
  p_mastery: number;
  attempts: number;
  luminosity: number;
  is_due: boolean;
  retention: number;
  has_misconception: boolean;
  ease_factor?: number;
  interval_days?: number;
}

interface ConstellationCanvasProps {
  concepts: ConstellationConcept[];
  onSelectConcept: (concept: ConstellationConcept) => void;
  selectedConceptId?: string | null;
}

const CLUSTERS = [
  { name: "Electrostatics & Charge", x: 100, y: 40 },
  { name: "Current & Circuits", x: 230, y: 40 },
  { name: "Potential Difference", x: 380, y: 40 },
  { name: "Ohm's Law & Resistance", x: 550, y: 60 },
  { name: "Series & Parallel", x: 720, y: 60 },
  { name: "Heating & Energy", x: 880, y: 80 },
  { name: "Power & Domestic Safety", x: 1030, y: 100 }
];

export function ConstellationCanvas({
  concepts,
  onSelectConcept,
  selectedConceptId
}: ConstellationCanvasProps) {
  const [hoveredConcept, setHoveredConcept] = useState<ConstellationConcept | null>(null);
  const [zoom, setZoom] = useState(1);

  // Shooting-star & soft sound-free glow pulse state
  const [elevatedStar, setElevatedStar] = useState<{
    id: string;
    name: string;
    x: number;
    y: number;
    p_mastery: number;
  } | null>(null);
  const [shootingStar, setShootingStar] = useState<{
    id: number;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);

  const prevMasteriesRef = useRef<Map<string, number>>(new Map());

  const triggerElevationEffect = (concept: ConstellationConcept) => {
    const targetX = concept.x_hint || 500;
    const targetY = concept.y_hint || 350;

    setElevatedStar({
      id: concept.concept_id,
      name: concept.name,
      x: targetX,
      y: targetY,
      p_mastery: concept.p_mastery
    });

    setShootingStar({
      id: Date.now(),
      startX: Math.max(30, targetX - 220),
      startY: Math.max(30, targetY - 140),
      endX: targetX,
      endY: targetY
    });

    setTimeout(() => {
      setShootingStar(null);
    }, 2200);

    setTimeout(() => {
      setElevatedStar(null);
    }, 4500);
  };

  // Detect when any star's mastery increases
  useEffect(() => {
    if (!concepts || concepts.length === 0) return;
    const prev = prevMasteriesRef.current;

    let highestBoost = 0;
    let boostedConcept: ConstellationConcept | null = null;

    concepts.forEach((c) => {
      const oldVal = prev.get(c.concept_id);
      if (oldVal !== undefined && c.p_mastery > oldVal + 0.02) {
        const diff = c.p_mastery - oldVal;
        if (diff > highestBoost) {
          highestBoost = diff;
          boostedConcept = c;
        }
      }
      prev.set(c.concept_id, c.p_mastery);
    });

    if (boostedConcept) {
      triggerElevationEffect(boostedConcept);
    }
  }, [concepts]);

  const conceptMap = useMemo(() => {
    return new Map<string, ConstellationConcept>(concepts.map((c) => [c.concept_id, c]));
  }, [concepts]);

  // Edges between prerequisite and dependent concepts
  const edges = useMemo(() => {
    const list: { from: ConstellationConcept; to: ConstellationConcept; bothMastered: boolean }[] = [];
    for (const concept of concepts) {
      if (concept.prerequisites && concept.prerequisites.length > 0) {
        for (const prereqId of concept.prerequisites) {
          const prereq = conceptMap.get(prereqId);
          if (prereq) {
            list.push({
              from: prereq,
              to: concept,
              bothMastered: prereq.p_mastery >= 0.75 && concept.p_mastery >= 0.75
            });
          }
        }
      }
    }
    return list;
  }, [concepts, conceptMap]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950 shadow-2xl">
      {/* Cosmic Space Background with Star Dust */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black pointer-events-none" />
      <div className="absolute top-1/4 left-1/5 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none animate-nebula" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none animate-nebula" />
      <div className="absolute top-2/3 right-1/3 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none animate-nebula" />

      {/* Header Info Overlay */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-3 pointer-events-auto">
        <div className="px-3 py-1.5 rounded-xl cosmic-glass flex items-center gap-2 text-xs text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
          <span>Star Size & Brightness = Mastery P(L)</span>
        </div>
        <div className="px-3 py-1.5 rounded-xl cosmic-glass flex items-center gap-2 text-xs text-rose-300">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-flare" />
          <span>Red Solar Flare = Active Misconception Bug</span>
        </div>
        <div className="px-3 py-1.5 rounded-xl cosmic-glass flex items-center gap-2 text-xs text-amber-300">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-due-pulse" />
          <span>Amber Pulse = Spaced Review Due</span>
        </div>
      </div>

      {/* Controls Overlay */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 cosmic-glass p-1 rounded-xl pointer-events-auto">
        <button
          onClick={() => {
            const randomConcept = concepts[Math.floor(Math.random() * concepts.length)];
            if (randomConcept) triggerElevationEffect(randomConcept);
          }}
          title="Simulate Shooting Star & Soft Glow Pulse"
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-cyan-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition-all border border-cyan-500/20"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="hidden sm:inline">Shooting Star</span>
        </button>
        <button
          onClick={() => setZoom((z) => Math.min(1.5, z + 0.15))}
          title="Zoom In"
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.7, z - 0.15))}
          title="Zoom Out"
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(1)}
          title="Reset View"
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Elevation Toast */}
      {elevatedStar && (
        <div className="absolute top-16 left-4 z-20 flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-900/95 border border-emerald-500/50 shadow-[0_0_20px_rgba(52,211,153,0.3)] text-xs font-bold text-white transition-all">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span>
            🌠 Shooting Star! &ldquo;{elevatedStar.name}&rdquo; mastery ascended to{" "}
            <span className="text-emerald-400">{(elevatedStar.p_mastery * 100).toFixed(0)}%</span>!
          </span>
        </div>
      )}

      {/* SVG Interactive Constellation Sky */}
      <div className="w-full overflow-x-auto overflow-y-hidden cursor-crosshair">
        <svg
          viewBox="0 0 1180 720"
          className="w-full h-auto min-w-[950px] transition-transform duration-200"
          style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
        >
          <defs>
            {/* Celestial Gradients */}
            <radialGradient id="starGlowNormal" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="35%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#0284c7" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="starGlowMastered" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="25%" stopColor="#a7f3d0" stopOpacity="0.9" />
              <stop offset="55%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="starGlowDue" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="30%" stopColor="#fef08a" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="flareGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fee2e2" stopOpacity="1" />
              <stop offset="30%" stopColor="#ef4444" stopOpacity="0.95" />
              <stop offset="65%" stopColor="#b91c1c" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0" />
            </radialGradient>

            {/* Shooting Star Comet Tail */}
            <linearGradient id="cometTail" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="40%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="85%" stopColor="#34d399" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
            </linearGradient>

            <filter id="glowFilter" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Ambient Stars */}
          {Array.from({ length: 90 }).map((_, i) => {
            const rx = (i * 137.5) % 1160 + 10;
            const ry = (i * 219.3) % 700 + 10;
            const rSize = (i % 3 === 0 ? 1.5 : 1) * (0.6 + ((i * 17) % 10) / 15);
            const opacity = 0.2 + ((i * 31) % 60) / 100;
            return (
              <circle
                key={`bg_star_${i}`}
                cx={rx}
                cy={ry}
                r={rSize}
                fill="#e2e8f0"
                opacity={opacity}
              />
            );
          })}

          {/* Cluster Category Headers */}
          {CLUSTERS.map((cl, idx) => (
            <text
              key={`cl_${idx}`}
              x={cl.x}
              y={cl.y}
              fill="#64748b"
              fontSize="10"
              fontWeight="700"
              letterSpacing="0.08em"
              textAnchor="middle"
              className="select-none uppercase tracking-wider"
            >
              {cl.name}
            </text>
          ))}

          {/* Prerequisite Constellation Lines */}
          <g className="constellation-lines">
            {edges.map((edge, idx) => {
              const x1 = edge.from.x_hint || 100;
              const y1 = edge.from.y_hint || 100;
              const x2 = edge.to.x_hint || 200;
              const y2 = edge.to.y_hint || 200;

              const strokeColor = edge.bothMastered
                ? "rgba(56, 189, 248, 0.6)"
                : edge.from.p_mastery >= 0.5
                ? "rgba(129, 140, 248, 0.35)"
                : "rgba(100, 116, 139, 0.2)";

              const strokeWidth = edge.bothMastered ? 2 : 1.2;

              return (
                <line
                  key={`edge_${idx}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={edge.bothMastered ? "none" : "3,3"}
                  className="transition-all duration-500"
                />
              );
            })}
          </g>

          {/* Shooting Star Animation Overlay */}
          {shootingStar && (
            <g className="pointer-events-none">
              <line
                x1={shootingStar.startX}
                y1={shootingStar.startY}
                x2={shootingStar.endX}
                y2={shootingStar.endY}
                stroke="url(#cometTail)"
                strokeWidth="3.5"
                strokeLinecap="round"
                opacity="0.9"
              />
              <circle
                cx={shootingStar.endX}
                cy={shootingStar.endY}
                r="4.5"
                fill="#ffffff"
                filter="url(#glowFilter)"
              />
            </g>
          )}

          {/* Star Nodes */}
          {concepts.map((concept) => {
            const x = concept.x_hint || 200;
            const y = concept.y_hint || 200;
            const isSelected = selectedConceptId === concept.concept_id;
            const isElevated = elevatedStar?.id === concept.concept_id;

            // Size scales with mastery
            const baseRadius = 5 + concept.p_mastery * 9; // 5 to 14
            const glowRadius = baseRadius * (1.8 + concept.luminosity * 1.2);

            let coreColor = "#38bdf8";
            let glowGradId = "starGlowNormal";

            if (concept.p_mastery >= 0.8) {
              coreColor = "#34d399";
              glowGradId = "starGlowMastered";
            } else if (concept.is_due) {
              coreColor = "#f59e0b";
              glowGradId = "starGlowDue";
            }

            return (
              <g
                key={concept.concept_id}
                className="cursor-pointer group"
                onClick={() => onSelectConcept(concept)}
                onMouseEnter={() => setHoveredConcept(concept)}
                onMouseLeave={() => setHoveredConcept(null)}
              >
                {/* Soft Sound-Free Radiating Glow Pulse Rings (when mastery rises) */}
                {isElevated && (
                  <g className="pointer-events-none">
                    <circle
                      cx={x}
                      cy={y}
                      r={baseRadius * 1.6}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                      className="animate-star-surge"
                      style={{ transformOrigin: `${x}px ${y}px` }}
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r={baseRadius * 2.2}
                      fill="none"
                      stroke="#34d399"
                      strokeWidth="2"
                      className="animate-star-surge"
                      style={{ animationDelay: "0.4s", transformOrigin: `${x}px ${y}px` }}
                    />
                  </g>
                )}

                {/* Active Misconception Red Solar Flare */}
                {concept.has_misconception && (
                  <g className="animate-flare">
                    <circle
                      cx={x}
                      cy={y}
                      r={baseRadius * 3.5}
                      fill="url(#flareGradient)"
                      opacity="0.9"
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r={baseRadius * 2.2}
                      stroke="#ef4444"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray="4,2"
                    />
                  </g>
                )}

                {/* Spaced Review Due Pulse */}
                {concept.is_due && !concept.has_misconception && (
                  <circle
                    cx={x}
                    cy={y}
                    r={baseRadius * 2.4}
                    fill="url(#starGlowDue)"
                    className="animate-due-pulse"
                    opacity="0.75"
                  />
                )}

                {/* Star Outer Glow */}
                <circle
                  cx={x}
                  cy={y}
                  r={glowRadius}
                  fill={`url(#${glowGradId})`}
                  opacity={Math.max(0.2, concept.luminosity * 0.9)}
                  className="transition-all duration-700"
                />

                {/* Selection Ring */}
                {isSelected && (
                  <circle
                    cx={x}
                    cy={y}
                    r={baseRadius + 7}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeDasharray="3,3"
                    className="animate-spin"
                    style={{ transformOrigin: `${x}px ${y}px`, animationDuration: "8s" }}
                  />
                )}

                {/* Star Solid Core */}
                <circle
                  cx={x}
                  cy={y}
                  r={baseRadius}
                  fill={concept.has_misconception ? "#ef4444" : coreColor}
                  filter="url(#glowFilter)"
                  className="group-hover:scale-125 transition-transform duration-300"
                  style={{ transformOrigin: `${x}px ${y}px` }}
                />

                {/* Star Core Center Spark */}
                <circle cx={x} cy={y} r={Math.max(2, baseRadius * 0.35)} fill="#ffffff" />

                {/* Label Under Star */}
                <text
                  x={x}
                  y={y + baseRadius + 14}
                  textAnchor="middle"
                  fill={isSelected ? "#ffffff" : concept.has_misconception ? "#fca5a5" : "#cbd5e1"}
                  fontSize={isSelected ? "11" : "9.5"}
                  fontWeight={isSelected ? "700" : "500"}
                  className="pointer-events-none select-none transition-all drop-shadow-md"
                >
                  {concept.name.length > 22 ? concept.name.slice(0, 20) + "…" : concept.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Floating Hover Card */}
      {hoveredConcept && (
        <div
          className="absolute bottom-4 left-4 z-20 cosmic-glass p-3.5 rounded-xl border border-slate-700/80 shadow-2xl max-w-sm pointer-events-none transition-all"
        >
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="font-bold text-sm text-white">{hoveredConcept.name}</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                hoveredConcept.has_misconception
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  : hoveredConcept.p_mastery >= 0.8
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
              }`}
            >
              {hoveredConcept.has_misconception
                ? "Active Bug"
                : hoveredConcept.p_mastery >= 0.8
                ? "Mastered"
                : "Learning"}
            </span>
          </div>

          <p className="text-xs text-slate-300 mb-2 leading-relaxed line-clamp-2">
            {hoveredConcept.short_explanation}
          </p>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px]">
            <div>
              <span className="text-slate-400 block">Mastery P(L)</span>
              <span className="font-bold text-cyan-400">
                {(hoveredConcept.p_mastery * 100).toFixed(0)}%
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Attempts</span>
              <span className="font-bold text-slate-200">{hoveredConcept.attempts}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Status</span>
              <span
                className={`font-semibold ${
                  hoveredConcept.is_due ? "text-amber-400" : "text-emerald-400"
                }`}
              >
                {hoveredConcept.is_due ? "Review Due" : "Retained"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
