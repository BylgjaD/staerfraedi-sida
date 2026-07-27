import { ArrowLeft, Lock, CheckCircle2 } from "lucide-react";
import { Level } from "../../lib/types";
import PageHeader from "./PageHeader";

import {
  LEVEL_META,
  CategoryData,
  SectionData,
} from "../../data/categories";
import { useState } from "react";
import { BookOpen } from "lucide-react";
function LevelView({
  category, section, level, isCompleted, onComplete, onBack,
}: {
  category: CategoryData;
  section: SectionData;
  level: Level;
  isCompleted: boolean;
  onComplete: () => void;
  onBack: () => void;
}) {
  const [justCompleted, setJustCompleted] = useState(false);
  const meta = LEVEL_META[level];

  const handleComplete = () => {
    onComplete();
    setJustCompleted(true);
    setTimeout(onBack, 1200);
  };

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <header className="sticky top-0 z-20 bg-card border-b border-border">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={onBack}
            className="flex items-center gap-2 text-sm font-semibold hover:text-foreground text-muted-foreground transition-colors">
            <ArrowLeft size={16} /> Til baka
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{ background: `${meta.hex}15`, color: meta.hex }}>
            <span className="text-base font-bold">{level}</span> {meta.label}
          </div>
           <PageHeader
           title={`${section.abbr}-${level} · ${section.name}`}
            description={category.name}
             />
        </div>

        {/* Verkefni notanda */}
        <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-border flex items-center gap-3">
            <BookOpen size={18} style={{ color: category.accentColor }} />
            <span className="font-semibold text-sm">Verkefni</span>
          </div>
          <div className="px-5 py-8 text-center space-y-4">
            <div className="text-4xl">📐</div>
            <div>
              <div className="font-semibold mb-2" style={{ color: "#1e3a5f" }}>
                {section.name} — {meta.label} stig
              </div>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
                Hér koma verkefni á {meta.label.toLowerCase()} stigi fyrir {section.name.toLowerCase()}.
                Leysðu öll verkefnin til að ljúka þessu stigi og opna næsta.
              </p>
            </div>
            {/* Spurningabox */}
            <div className="grid grid-cols-3 gap-2 mt-4 max-w-xs mx-auto">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-14 rounded-lg border border-border bg-muted/30 flex items-center justify-center text-xs text-muted-foreground">
                  {n}. spurning
                </div>
              ))}
            </div>
          </div>
        </div>

        {isCompleted || justCompleted ? (
          <div className="flex items-center justify-center gap-2 py-4 text-emerald-600 font-semibold">
            <CheckCircle2 size={20} />
            {justCompleted ? "Frábærlega gert! Hleður..." : "Þetta stig er þegar lokið"}
          </div>
        ) : (
          <button onClick={handleComplete}
            className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-98 text-white shadow-sm"
            style={{ background: `linear-gradient(135deg, ${meta.hex}, ${meta.hex}cc)` }}>
            Ljúka stigi {level} · {meta.label}
          </button>
        )}
      </main>
    </div>
  );
}
export default LevelView;