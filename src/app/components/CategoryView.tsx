import React from "react";
import {
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  Lock,
} from "lucide-react";

import type {
  Level,
  LevelKey,
} from "../../lib/types";

import {
  LEVELS,
  LEVEL_META,
} from "../../data/categories";

import type {
  CategoryData,
} from "../../data/categories";

import SectionNode from "./SectionNode";

import {
  lk,
  isUnlocked,
  categoryProgress,
} from "../../lib/progress";

interface CategoryViewProps {
  category: CategoryData;
  completed: LevelKey[];
  onBack: () => void;
  onSelectLevel: (
    catId: string,
    secId: string,
    level: Level
  ) => void;
}

export default function CategoryView({
  category,
  completed,
  onBack,
  onSelectLevel,
}: CategoryViewProps) {
 
  const { done, total } = categoryProgress(completed, category.id);
  const pct = Math.round((done / total) * 100);

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <header className="sticky top-0 z-20 bg-card border-b border-border">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <button onClick={onBack}
            className="flex items-center gap-2 text-sm font-semibold hover:text-foreground text-muted-foreground transition-colors">
            <ArrowLeft size={16} /> Til baka
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold" style={{ color: category.accentColor }}>{category.icon}</span>
            <span className="font-bold text-sm hidden sm:block" style={{ color: "#1e3a5f" }}>{category.name}</span>
          </div>
          <div className="text-xs text-muted-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>
            {done}/{total} stig
          </div>
        </div>
        <div className="h-1 overflow-hidden">
          <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, background: category.accentColor }} />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Level legend */}
        <div className="flex items-center gap-4 mb-8 flex-wrap">
          {LEVELS.map((l) => (
            <div key={l} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-sm ${LEVEL_META[l].bgClass}`} />
              <span className="text-xs text-muted-foreground">{l} · {LEVEL_META[l].label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <Lock size={12} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Læst</span>
          </div>
        </div>

        {/* Tree layout */}
        <div className="flex flex-col items-center gap-0">
          {category.treeRows.map((row, rowIdx) => {
            const sections = row.map((secId) => category.sections.find((s) => s.id === secId)!).filter(Boolean);

            return (
              <div key={rowIdx} className="w-full flex flex-col items-center">
                {/* Connector from previous row */}
                {rowIdx > 0 && (
                  <div className="flex justify-center items-center h-10 w-full relative">
                    {row.length === 1 && category.treeRows[rowIdx - 1].length > 1 ? (
                      // Converging: multiple → one
                      <div className="flex items-end justify-center gap-0 w-full" style={{ maxWidth: 420 }}>
                        <div className="flex-1 h-px" style={{ borderTop: "2px solid #d1c9be", marginBottom: 20 }} />
                        <div className="w-px self-stretch" style={{ background: "#d1c9be", height: 40 }} />
                        <div className="flex-1 h-px" style={{ borderTop: "2px solid #d1c9be", marginBottom: 20 }} />
                      </div>
                    ) : row.length > 1 && category.treeRows[rowIdx - 1].length === 1 ? (
                      // Branching: one → multiple
                      <div className="flex items-start justify-center gap-0 w-full" style={{ maxWidth: 420 }}>
                        <div className="flex-1 h-px" style={{ borderTop: "2px solid #d1c9be", marginTop: 20 }} />
                        <div className="w-px self-stretch" style={{ background: "#d1c9be", height: 40 }} />
                        <div className="flex-1 h-px" style={{ borderTop: "2px solid #d1c9be", marginTop: 20 }} />
                      </div>
                    ) : (
                      // Straight connector
                      <div className="w-px h-full" style={{ background: "#d1c9be" }} />
                    )}
                  </div>
                )}

                {/* Row of section nodes */}
                <div className={`flex justify-center gap-4 w-full ${row.length > 1 ? "items-start" : "items-center"}`}
                  style={{ maxWidth: row.length > 1 ? 520 : 300, margin: "0 auto" }}>
                  {sections.map((sec) => (
                    <div key={sec.id} className="flex-1" style={{ maxWidth: row.length > 1 ? 240 : 300 }}>
                      <SectionNode
                        catId={category.id}
                        section={sec}
                        completed={completed}
                        onSelectLevel={onSelectLevel}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}