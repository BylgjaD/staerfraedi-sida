import React from "react";
import {LogOut,
  ChevronRight,
  CheckCircle2, } from "lucide-react";

import type {
  UserData,
  LevelKey,
} from "../../lib/types";

import {
  CATEGORIES,
  LEVELS,
  LEVEL_META,
} from "../../Data/categories";

import {
  lk,
  isUnlocked,
  categoryProgress,
} from "../../lib/progress";

interface DashboardViewProps {
  users: Record<string, UserData>;
  setUsers: React.Dispatch<
    React.SetStateAction<Record<string, UserData>>
  >;
   currentUser: UserData;
   onSelectCategory: (id: string) => void;
  onLogout?: () => void;
  isTeacherPreview?: boolean;
}
export default function DashboardView({
  users,
  setUsers,
  currentUser,
  onSelectCategory,
  onLogout,
  isTeacherPreview = false,
}: DashboardViewProps) {

  const totalLevels = CATEGORIES.reduce((s, c) => s + c.sections.length * 3, 0);
  const totalDone = CATEGORIES.reduce((s, c) => {
    const { done } = categoryProgress(currentUser.completed, c.id);
    return s + done;
  }, 0);
  const overallPct = Math.round((totalDone / totalLevels) * 100);

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-20 bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl font-bold" style={{ color: "#c8952a" }}>Δ</span>
            <div>
              <span className="font-bold text-sm" style={{ color: "#1e3a5f" }}>DELTA</span>
              <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">Mælistika í stærðfræði</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isTeacherPreview && (
              <>
                <span className="text-sm text-muted-foreground hidden sm:block" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {currentUser.name}
                </span>
                <button onClick={onLogout}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded">
                  <LogOut size={15} />
                  <span className="hidden sm:inline">Útskrá</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Progress banner */}
        {!isTeacherPreview && (
          <div className="rounded-xl p-5 mb-8 text-white"
            style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2d5a8f 100%)" }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-semibold">Góðan daginn, {currentUser.name.split(" ")[0]}!</div>
                <div className="text-sm text-white/70 mt-0.5">
                  {totalDone} af {totalLevels} stigum lokið · {overallPct}% framvinda
                </div>
              </div>
              <div className="text-3xl font-bold" style={{ color: "#c8952a" }}>{overallPct}%</div>
            </div>
            <div className="mt-4 h-2 rounded-full bg-white/20 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${overallPct}%`, background: "#c8952a" }} />
            </div>
          </div>
        )}

        <h2 className="text-sm font-semibold text-muted-foreground tracking-widest uppercase mb-4">Flokkar</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => {
            const { done, total } = categoryProgress(currentUser.completed, cat.id);
            const pct = Math.round((done / total) * 100);
            const firstLocked = !CATEGORIES.find((c) => c.id === cat.id)?.sections.some((s) =>
              isUnlocked(currentUser.completed, lk(cat.id, s.id, "δ"))
            );

            return (
              <button key={cat.id} onClick={() => onSelectCategory(cat.id)}
                className="group text-left bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-lg flex items-center justify-center text-xl font-bold"
                    style={{ background: `${cat.accentColor}15`, color: cat.accentColor }}>
                    {cat.icon}
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground mt-1 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="font-semibold text-sm mb-1" style={{ color: "#1e3a5f" }}>{cat.name}</div>
                <div className="text-xs text-muted-foreground mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {cat.sections.length} hlutar · {done}/{total} stig
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: cat.accentColor }} />
                </div>
                {done === 0 && (
                  <div className="text-xs mt-2" style={{ color: cat.accentColor }}>
                    Byrja hér →
                  </div>
                )}
                {done === total && (
                  <div className="text-xs mt-2 text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={12} /> Lokið!
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
