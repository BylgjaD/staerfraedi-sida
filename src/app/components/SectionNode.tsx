import React from "react";
import {
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
} from "../../Data/categories";

import type {
  SectionData,
} from "../../Data/categories";
import {
  lk,
  isUnlocked,
} from "../../lib/progress";

interface SectionNodeProps {
  catId: string;
  section: SectionData;
  completed: LevelKey[];
  onSelectLevel: (
    catId: string,
    secId: string,
    level: Level
  ) => void;
}

export default function SectionNode({
  catId,
  section,
  completed,
  onSelectLevel,
}: SectionNodeProps) {

   const levelStates = LEVELS.map((level) => {
    const key = lk(catId, section.id, level);
    const done = completed.includes(key);
    const unlocked = isUnlocked(completed, key);
    return { level, key, done, unlocked };
  }); {
  const levelStates = LEVELS.map((level) => {
    const key = lk(catId, section.id, level);
    const done = completed.includes(key);
    const unlocked = isUnlocked(completed, key);
    return { level, key, done, unlocked };
  });

  const sectionDone = levelStates.every((s) => s.done);
  const sectionStarted = levelStates.some((s) => s.done || s.unlocked);

  return (
    <div className={`rounded-xl border bg-card transition-all duration-200 w-full max-w-xs ${sectionDone ? "border-emerald-300" : "border-border"}`}
      style={{ minWidth: 180 }}>
      <div className="px-4 pt-3 pb-2 border-b border-border flex items-center justify-between">
        <div>
          <div className="font-semibold text-sm" style={{ color: "#1e3a5f" }}>{section.name}</div>
          <div className="text-xs text-muted-foreground font-mono">{section.abbr}</div>
        </div>
        {sectionDone && <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />}
      </div>
      <div className="px-3 py-3 flex gap-2">
        {levelStates.map(({ level, done, unlocked }) => {
          const meta = LEVEL_META[level];
          return (
            <button
              key={level}
              onClick={() => unlocked && onSelectLevel(catId, section.id, level)}
              disabled={!unlocked}
              title={`${section.name} ${meta.label} (${level})`}
              className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg text-xs font-bold transition-all duration-150 ${
                done
                  ? `${meta.bgClass} text-white shadow-sm`
                  : unlocked
                  ? `bg-card border-2 ${meta.borderClass} ${meta.colorClass} hover:opacity-80 active:scale-95`
                  : "bg-muted/50 text-muted-foreground cursor-not-allowed"
              }`}>
              {done ? (
                <CheckCircle2 size={13} />
              ) : unlocked ? null : (
                <Lock size={11} />
              )}
              <span>{level}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}}