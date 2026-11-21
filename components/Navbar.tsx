"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Compass, Users, PlayCircle, RotateCcw } from "lucide-react";
import { useState } from "react";

interface NavbarProps {
  onFastForwardDemo?: () => Promise<void>;
  onResetStudent?: () => Promise<void>;
  isLoading?: boolean;
}

export function Navbar({ onFastForwardDemo, onResetStudent, isLoading = false }: NavbarProps) {
  const pathname = usePathname();
  const [demoActive, setDemoActive] = useState(false);

  const handleDemoClick = async () => {
    if (onFastForwardDemo) {
      setDemoActive(true);
      await onFastForwardDemo();
      setTimeout(() => setDemoActive(false), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link href="/student" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
            <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400 group-hover:text-pink-400 group-hover:scale-110 transition-all" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                Constellation<span className="text-indigo-400 font-light">Ed</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                Physics 10
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Chapter: Electricity · Adaptive Learner Model
            </p>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/student"
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              pathname === "/student" || pathname === "/"
                ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Compass className="w-4 h-4 text-indigo-400" />
            <span>Student Sky</span>
          </Link>

          <Link
            href="/teacher"
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              pathname === "/teacher"
                ? "bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-sm shadow-purple-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Users className="w-4 h-4 text-purple-400" />
            <span className="relative">
              Teacher Hub
              <span className="absolute -top-1 -right-4 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </span>
          </Link>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onFastForwardDemo && (
            <button
              onClick={handleDemoClick}
              disabled={isLoading}
              title="Fast-forward student state: activates varied mastery, active red flare misconceptions, and spaced repetition"
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all ${
                demoActive
                  ? "bg-emerald-500 text-slate-950 font-bold"
                  : "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 hover:border-amber-400 hover:from-amber-500/30 hover:to-orange-500/30 shadow-sm shadow-amber-500/10"
              }`}
            >
              <PlayCircle className={`w-4 h-4 ${demoActive ? "animate-spin" : "text-amber-400"}`} />
              <span className="hidden md:inline">Demo Mode (3 min)</span>
              <span className="md:hidden">Demo</span>
            </button>
          )}

          {onResetStudent && (
            <button
              onClick={onResetStudent}
              disabled={isLoading}
              title="Reset student data to default prior"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
