import React, { useState, useMemo } from "react";
import {
  Lock,
  CheckCircle2,
  LogOut,
  Users,
  ArrowLeft,
  ChevronRight,
  BookOpen,
  Eye,
  EyeOff,
  GraduationCap,
  Award,
  BarChart3,
  ArrowDown,
} from "lucide-react";
import { 
  supabase,
  loadTeachersFromSupabase,
  saveTeacherToSupabase,
  deleteTeacherFromSupabase,
  updateTeacherInSupabase,
  loadStudentsFromSupabase,
  saveStudentToSupabase,
  deleteStudentFromSupabase, 
  updateStudentInSupabase,
} from "../Lib/supabase";
import { useEffect } from "react";
// ─── Types ───────────────────────────────────────────────────────────────────
type Level = "δ" | "β" | "α";
type LevelKey = string; // `${catId}__${secId}__${level}`
type ViewType = "login" | "dashboard" | "category" | "level" | "teacher";

interface SectionData {
  id: string;
  name: string;
  abbr: string;
}

interface CategoryData {
  id: string;
  name: string;
  icon: string;
  accentColor: string;
  sections: SectionData[];
  treeRows: string[][];
}

interface UserData {
  email: string;
  name: string;
  role: "student" | "teacher" | "admin";
  completed: LevelKey[];
}

// ─── Constants ───────────────────────────────────────────────────────────────
const LEVELS: Level[] = ["δ", "β", "α"];

const LEVEL_META: Record<Level, { label: string; colorClass: string; bgClass: string; borderClass: string; hex: string }> = {
  δ: { label: "Delta", colorClass: "text-emerald-700", bgClass: "bg-emerald-500", borderClass: "border-emerald-400", hex: "#059669" },
  β: { label: "Beta",  colorClass: "text-blue-700",    bgClass: "bg-blue-500",    borderClass: "border-blue-400",    hex: "#2563eb" },
  α: { label: "Alpha", colorClass: "text-amber-700",   bgClass: "bg-amber-500",   borderClass: "border-amber-400",   hex: "#d97706" },
};

const CATEGORIES: CategoryData[] = [
  {
    id: "talnaskilningur",
    name: "Talnaskilningur",
    icon: "∑",
    accentColor: "#16a34a",
    sections: [
      { id: "hugareikningur",  name: "Hugareikningur",  abbr: "H" },
      { id: "slumpreikningur", name: "Slumpreikningur", abbr: "S" },
      { id: "rod_asgorð",      name: "Röð ásgörð",      abbr: "RÁ" },
      { id: "frumtolur",       name: "Frumtölur",       abbr: "F" },
      { id: "talnamengi",      name: "Talnamengi",      abbr: "T" },
    ],
    treeRows: [["hugareikningur"], ["slumpreikningur"], ["rod_asgorð"], ["frumtolur"], ["talnamengi"]],
  },
  {
    id: "brot_og_prosentur",
    name: "Almenn brot og prósentur",
    icon: "½",
    accentColor: "#7c3aed",
    sections: [
      { id: "almenn_brot",   name: "Almenn brot",   abbr: "AB" },
      { id: "prosentur",     name: "Prósentur",     abbr: "P" },
      { id: "hlutfoll",      name: "Hlutföll",      abbr: "H" },
      { id: "breytipastur",  name: "Breytipástur",  abbr: "B" },
    ],
    treeRows: [["almenn_brot"], ["prosentur"], ["hlutfoll"], ["breytipastur"]],
  },
  {
    id: "algebra",
    name: "Algebra",
    icon: "χ",
    accentColor: "#2563eb",
    sections: [
      { id: "mynstur",  name: "Mynstur",         abbr: "M" },
      { id: "breytur",  name: "Breytur",          abbr: "B" },
      { id: "veldi",    name: "Veldi og rætur",   abbr: "VR" },
      { id: "staedur",  name: "Stæður",           abbr: "ST" },
      { id: "stadal",   name: "Staðalform",       abbr: "SF" },
      { id: "jadnur",   name: "Jöfnur",           abbr: "J" },
      { id: "ojadnur",  name: "Ójöfnur",          abbr: "OJ" },
    ],
    treeRows: [
      ["mynstur"],
      ["breytur", "veldi"],
      ["staedur", "stadal"],
      ["jadnur"],
      ["ojadnur"],
    ],
  },
  {
    id: "hnitakerfi",
    name: "Hnitakerfi og föll",
    icon: "f(x)",
    accentColor: "#0891b2",
    sections: [
      { id: "hnitakerfi_sec", name: "Hnitakerfi",    abbr: "H" },
      { id: "hallatala",      name: "Hallatala",     abbr: "HL" },
      { id: "linuleg_foll",   name: "Línuleg föll",  abbr: "LF" },
      { id: "falla_likon",    name: "Falla líkon",   abbr: "FL" },
    ],
    treeRows: [["hnitakerfi_sec"], ["hallatala"], ["linuleg_foll"], ["falla_likon"]],
  },
  {
    id: "rumfraedi",
    name: "Rúmfræði",
    icon: "△",
    accentColor: "#dc2626",
    sections: [
      { id: "formfraedi",      name: "Formfræði",                  abbr: "FF" },
      { id: "ummal_flatarmal", name: "Ummál og Flatarmál",         abbr: "UF" },
      { id: "rummal",          name: "Rúmmál",                     abbr: "R" },
      { id: "maelikvord",      name: "Mælikvörðar og mælieiningar", abbr: "MM" },
      { id: "hornafraedi",     name: "Hornafræði",                 abbr: "HF" },
      { id: "pythagoras",      name: "Þýjagóras",                  abbr: "Þ" },
    ],
    treeRows: [["formfraedi"], ["ummal_flatarmal"], ["rummal"], ["maelikvord"], ["hornafraedi"], ["pythagoras"]],
  },
  {
    id: "tolfraedi",
    name: "Tölfræði og líkur",
    icon: "σ",
    accentColor: "#d97706",
    sections: [
      { id: "medaltal",      name: "Meðaltal",     abbr: "M" },
      { id: "midgildi",      name: "Miðgildi",     abbr: "MG" },
      { id: "tidasta_gildi", name: "Tíðasta gildi", abbr: "TG" },
      { id: "likur",         name: "Líkur",        abbr: "L" },
      { id: "mjndrit",       name: "Mjndrit",      abbr: "MJ" },
      { id: "tolkun_grafa",  name: "Túlkun grafa", abbr: "TG" },
      { id: "mengi",         name: "Mengi",        abbr: "MN" },
    ],
    treeRows: [["medaltal"], ["midgildi"], ["tidasta_gildi"], ["likur"], ["mjndrit"], ["tolkun_grafa"], ["mengi"]],
  },
  {
    id: "fjarmala",
    name: "Fjármálalæsi",
    icon: "₿",
    accentColor: "#059669",
    sections: [
      { id: "laun",          name: "Laun og launaseðlar",    abbr: "L" },
      { id: "sparnaður",     name: "Sparnaður",              abbr: "S" },
      { id: "vextir",        name: "Vextir",                 abbr: "V" },
      { id: "skattar",       name: "Skattar",                abbr: "SK" },
      { id: "verdbólga",     name: "Verðbólga",              abbr: "VB" },
      { id: "fjarhags",      name: "Fjárhagsáætlun",         abbr: "FJ" },
      { id: "debetkort",     name: "Debetkort og Kreditkort", abbr: "D" },
    ],
    treeRows: [["laun"], ["sparnaður"], ["vextir"], ["skattar"], ["verdbólga"], ["fjarhags"], ["debetkort"]],
  },
];

// ─── Prerequisite System ─────────────────────────────────────────────────────
const lk = (cat: string, sec: string, level: Level): LevelKey => `${cat}__${sec}__${level}`;

function buildPrereqMap(): Record<LevelKey, LevelKey[]> {
  const map: Record<LevelKey, LevelKey[]> = {};

  const addSection = (catId: string, secId: string, firstPrereqs?: LevelKey[]) => {
    if (firstPrereqs) map[lk(catId, secId, "δ")] = firstPrereqs;
    map[lk(catId, secId, "β")] = [lk(catId, secId, "δ")];
    map[lk(catId, secId, "α")] = [lk(catId, secId, "β")];
  };

  const addLinear = (catId: string, sections: SectionData[]) => {
    sections.forEach((sec, i) => {
      addSection(catId, sec.id, i > 0 ? [lk(catId, sections[i - 1].id, "α")] : undefined);
    });
  };

  addLinear("talnaskilningur", CATEGORIES[0].sections);
  addLinear("brot_og_prosentur", CATEGORIES[1].sections);

  // Algebra branching tree (matches image 1)
  addSection("algebra", "mynstur");
  addSection("algebra", "breytur", [lk("algebra", "mynstur", "α")]);
  addSection("algebra", "veldi",   [lk("algebra", "mynstur", "α")]);
  addSection("algebra", "staedur", [lk("algebra", "breytur", "α")]);
  addSection("algebra", "stadal",  [lk("algebra", "veldi",   "α")]);
  addSection("algebra", "jadnur",  [lk("algebra", "staedur", "α"), lk("algebra", "stadal", "α")]);
  addSection("algebra", "ojadnur", [lk("algebra", "jadnur",  "α")]);

  addLinear("hnitakerfi", CATEGORIES[3].sections);
  addLinear("rumfraedi",  CATEGORIES[4].sections);
  addLinear("tolfraedi",  CATEGORIES[5].sections);
  addLinear("fjarmala",   CATEGORIES[6].sections);

  return map;
}

const PREREQS = buildPrereqMap();

function isUnlocked(completed: Set<LevelKey>, key: LevelKey): boolean {
  const prereqs = PREREQS[key];
  if (!prereqs || prereqs.length === 0) return true;
  return prereqs.every((p) => completed.has(p));
}

function categoryProgress(completed: Set<LevelKey>, catId: string): { done: number; total: number } {
  const cat = CATEGORIES.find((c) => c.id === catId)!;
  const total = cat.sections.length * 3;
  const done = cat.sections.reduce(
    (sum, sec) => sum + LEVELS.filter((l) => completed.has(lk(catId, sec.id, l))).length,
    0
  );
  return { done, total };
}

// ─── Storage / Auth ───────────────────────────────────────────────────────────
type TeacherRole = "teacher" | "admin";
const TEACHERS: {
  email: string;
  password: string;
  name: string;
  role: TeacherRole;
}[] = [
  {
    email: "bylgjaadmin@delta.is",
    password: "Skoli123",
    name: "Bylgja",
    role: "admin"
  },
  {
    email: "arna@delta.is",
    password: "arna123",
    name: "Arna",
    role: "teacher"
  },
  {
    email: "bylgja@delta.is",
    password: "bylgja123",
    name: "Bylgja",
    role: "teacher"
  }
];
function loadTeachers() {
  const stored = localStorage.getItem("delta_teachers");

  if (stored) {
    return JSON.parse(stored);
  }

  localStorage.setItem("delta_teachers", JSON.stringify(TEACHERS));
  return TEACHERS;
}

function saveTeachers(teachers: typeof TEACHERS) {
  localStorage.setItem("delta_teachers", JSON.stringify(teachers));
}

function loadUsers(): Record<string, UserData> {
  try {
    const s = localStorage.getItem("delta_users");
    return s ? JSON.parse(s) : {};
  } catch {
    return {};
  }
}

function saveUsers(users: Record<string, UserData>) {
  localStorage.setItem("delta_users", JSON.stringify(users));
}

function initUsers(): Record<string, UserData> {
  const stored = loadUsers();
  if (Object.keys(stored).length > 0) return stored;

  // Seed 3 demo students
  const alg = "algebra";
  const tal = "talnaskilningur";

  const u1: LevelKey[] = [
    ...CATEGORIES[0].sections.flatMap((s) => LEVELS.map((l) => lk(tal, s.id, l))),
    lk("brot_og_prosentur", "almenn_brot", "δ"),
    lk("brot_og_prosentur", "almenn_brot", "β"),
    lk("brot_og_prosentur", "almenn_brot", "α"),
    lk("brot_og_prosentur", "prosentur",   "δ"),
    lk("brot_og_prosentur", "prosentur",   "β"),
    lk(alg, "mynstur", "δ"),
    lk(alg, "mynstur", "β"),
    lk(alg, "mynstur", "α"),
    lk(alg, "breytur", "δ"),
    lk(alg, "veldi",   "δ"),
  ];
  const u2: LevelKey[] = [
    ...CATEGORIES[0].sections.slice(0, 3).flatMap((s) => LEVELS.map((l) => lk(tal, s.id, l))),
    lk(tal, "frumtolur", "δ"),
    lk(alg, "mynstur", "δ"),
    lk(alg, "mynstur", "β"),
  ];
  const u3: LevelKey[] = [
    lk(tal, "hugareikningur", "δ"),
    lk(tal, "hugareikningur", "β"),
  ];

  const users: Record<string, UserData> = {
    "sigrun@nemandi.is": { email: "sigrun@nemandi.is", name: "Sigrun Björnsdóttir",  role: "student", completed: u1 },
    "bjorn@nemandi.is":  { email: "bjorn@nemandi.is",  name: "Björn Sigurðsson",     role: "student", completed: u2 },
    "helga@nemandi.is":  { email: "helga@nemandi.is",  name: "Helga Magnúsdóttir",   role: "student", completed: u3 },
  };
  saveUsers(users);
  return users;
}

// ─── Login View ───────────────────────────────────────────────────────────────
function LoginView({ onLogin }: { onLogin: (email: string, pass: string) => string | null }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError("Vinsamlegast sláðu inn netfang"); return; }
    setLoading(true);
    setTimeout(() => {
      const err = onLogin(email.trim().toLowerCase(), password);
      if (err) setError(err);
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #1e3a5f 0%, #0f2240 60%, #0a1a30 100%)" }}>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <span className="text-5xl font-bold" style={{ color: "#c8952a" }}>Δ</span>
            <div>
              <div className="text-xl font-semibold tracking-wide">DELTA</div>
              <div className="text-xs text-white/60 tracking-widest uppercase">Mælistika í stærðfræði</div>
            </div>
          </div>
          <div className="space-y-10 mt-8">
            {[
              { icon: "Δ β α", label: "Þrjú þrefaraðir", desc: "Delta · Beta · Alpha" },
              { icon: "7", label: "Sjö flokkar", desc: "Frá talnaskilning - fjármála" },
              { icon: "🔓", label: "Kerfisbundið", desc: "Þú kemst ofar með því að ljúka verkefnum" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ background: "rgba(200,149,42,0.2)", color: "#c8952a" }}>
                  {item.icon}
                </div>
                <div>
                  <div className="font-semibold">{item.label}</div>
                  <div className="text-sm text-white/50">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 text-white/30 text-sm">
          Kennari? Notaðu: kennari@delta.is / kennari123
        </div>
        {/* Decorative circles */}
        <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full opacity-5"
          style={{ background: "#c8952a" }} />
        <div className="absolute top-20 -right-10 w-48 h-48 rounded-full opacity-5"
          style={{ background: "#c8952a" }} />
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <span className="text-4xl font-bold" style={{ color: "#c8952a", fontFamily: "'Outfit', sans-serif" }}>Δ</span>
            <div>
              <div className="text-lg font-bold" style={{ color: "#1e3a5f" }}>DELTA</div>
              <div className="text-xs text-muted-foreground tracking-widest uppercase">Mælistika í stærðfræði</div>
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ color: "#1e3a5f" }}>Velkominn!</h1>
          <p className="text-muted-foreground text-sm mb-8">Skráðu þig inn til að halda áfram</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "#1e3a5f" }}>Netfang</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="þú@dæmi.is"
                className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 text-sm"
                style={{ background: "#f0ece4", fontFamily: "'Inter', sans-serif" }}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "#1e3a5f" }}>Lykilorð</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 text-sm pr-10"
                  style={{ background: "#f0ece4", fontFamily: "'Inter', sans-serif" }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-lg text-sm font-semibold transition-all duration-200 active:scale-98"
              style={{ background: "#1e3a5f", color: "#fff", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Skrái inn..." : "Skrá inn"}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Nýr nemandi? Sláðuinn netfangið þitt til að búa til aðgang.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard View ───────────────────────────────────────────────────────────
function DashboardView({
  user, completed, onSelectCategory, onLogout, isTeacherPreview = false,
}: {
  user: UserData;
  completed: Set<LevelKey>;
  onSelectCategory: (id: string) => void;
  onLogout?: () => void;
  isTeacherPreview?: boolean;
}) {
  const totalLevels = CATEGORIES.reduce((s, c) => s + c.sections.length * 3, 0);
  const totalDone = CATEGORIES.reduce((s, c) => {
    const { done } = categoryProgress(completed, c.id);
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
                  {user.name}
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
                <div className="text-lg font-semibold">Góðan daginn, {user.name.split(" ")[0]}!</div>
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
            const { done, total } = categoryProgress(completed, cat.id);
            const pct = Math.round((done / total) * 100);
            const firstLocked = !CATEGORIES.find((c) => c.id === cat.id)?.sections.some((s) =>
              isUnlocked(completed, lk(cat.id, s.id, "δ"))
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

// ─── Section Node (tree cell) ─────────────────────────────────────────────────
function SectionNode({
  catId, section, completed, onSelectLevel,
}: {
  catId: string;
  section: SectionData;
  completed: Set<LevelKey>;
  onSelectLevel: (catId: string, secId: string, level: Level) => void;
}) {
  const levelStates = LEVELS.map((level) => {
    const key = lk(catId, section.id, level);
    const done = completed.has(key);
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
}

// ─── Category View ────────────────────────────────────────────────────────────
function CategoryView({
  category, completed, onBack, onSelectLevel,
}: {
  category: CategoryData;
  completed: Set<LevelKey>;
  onBack: () => void;
  onSelectLevel: (catId: string, secId: string, level: Level) => void;
}) {
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

// ─── Level View ───────────────────────────────────────────────────────────────
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
          <h1 className="text-2xl font-bold mb-1" style={{ color: "#1e3a5f" }}>
            {section.abbr}-{level} · {section.name}
          </h1>
          <p className="text-muted-foreground text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
            {category.name}
          </p>
        </div>

        {/* Assignment placeholder */}
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
            {/* Placeholder question boxes */}
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

// ─── Teacher View ─────────────────────────────────────────────────────────────
function TeacherView({
  users,
  setUsers,
  onLogout,
  currentUser,
}: {
  users: Record<string, UserData>;
  setUsers: React.Dispatch<React.SetStateAction<Record<string, UserData>>>;
  onLogout: () => void;
  currentUser: UserData;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [previewCategory, setPreviewCategory] = useState<string | null>(null);
  const [teacherList, setTeacherList] = useState<typeof TEACHERS>(
  loadTeachers()
);
const [studentList, setStudentList] = useState<UserData[]>([]);
const [editingTeacher, setEditingTeacher] =
  useState<(typeof TEACHERS)[number] | null>(null);
const [editingStudent, setEditingStudent] =
   useState<UserData | null>(null);

const [editStudentName, setEditStudentName] = useState("");
const [editStudentEmail, setEditStudentEmail] = useState("");
const [editName, setEditName] = useState("");
const [editEmail, setEditEmail] = useState("");
const [editPassword, setEditPassword] = useState("");
  const students = studentList;
  const teachers = teacherList.filter(
  (t: (typeof TEACHERS)[number]) => t.role === "teacher"
);
useEffect(() => {
  loadStudentsFromSupabase().then((data) => {
    console.log("Students from Supabase:", data);

    if (data && data.length > 0) {
      setStudentList(data as UserData[]);
    }
  });
}, []);
useEffect(() => {
  loadStudentsFromSupabase().then((data) => {
    console.log("Students from Supabase:", data);
  });
}, []);
  const isAdmin = currentUser.role === "admin";
  const [adminTab, setAdminTab] = useState<"students" | "teachers">("students");
  const [newTeacherName, setNewTeacherName] = useState("");
 
const [newTeacherEmail, setNewTeacherEmail] = useState("");
const [newTeacherPassword, setNewTeacherPassword] = useState("");
const [newStudentName, setNewStudentName] = useState("");
const [newStudentEmail, setNewStudentEmail] = useState("");
const deleteStudent = async (email: string) => {
  if (!window.confirm("Ertu viss um að þú viljir eyða þessum nemanda?")) {
    return;
  }

  await deleteStudentFromSupabase(email);

  setStudentList((prev) =>
    prev.filter((s) => s.email !== email)
  );
};

const deleteTeacher = async (email: string) => {
  if (!window.confirm("Ertu viss um að þú viljir eyða þessum kennara?")) {
    return;
  }

  const updatedTeachers = loadTeachers().filter(
    (t: (typeof TEACHERS)[number]) => t.email !== email
  );

  saveTeachers(updatedTeachers);
  await deleteTeacherFromSupabase(email);
setTeacherList(updatedTeachers);

setNewTeacherName("");
setNewTeacherEmail("");
setNewTeacherPassword("");

};
  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <header className="sticky top-0 z-20 bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold" style={{ color: "#c8952a" }}>Δ</span>
            <span className="font-bold text-sm" style={{ color: "#1e3a5f" }}>DELTA</span>
            <div className="hidden sm:flex items-center gap-1.5 ml-2 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: "#1e3a5f15", color: "#1e3a5f" }}>
              <GraduationCap size={12} /> Kennari
            </div>
            {isAdmin && (
              <div className="flex items-center gap-3">
                <div
      className="ml-2 px-2 py-1 rounded text-xs font-semibold"
      style={{ background: "#fbbf24", color: "#000" }}
    >
      👑 Admin
    </div>

    <button
      onClick={() => setAdminTab("students")}
      className="px-2 py-1 rounded text-xs border"
    >
      Nemendur
    </button>

    <button
      onClick={() => setAdminTab("teachers")}
      className="px-2 py-1 rounded text-xs border"
    >
      Kennarar
    </button>
  </div>
)}
          </div>
          <button onClick={onLogout}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <LogOut size={15} /> <span className="hidden sm:inline">Útskrá</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {isAdmin && (
          <>
            <div className="mb-6 flex gap-2">
              <button
                onClick={() => setAdminTab("students")}
                className="px-3 py-2 rounded border"
              >
                Nemendur
              </button>

              <button
                onClick={() => setAdminTab("teachers")}
                className="px-3 py-2 rounded border"
              >
                Kennarar
              </button>

              
            </div>

            {adminTab === "students" && (
  <div className="bg-card rounded-lg border p-4 mt-4">
    <h3 className="font-bold mb-4">Nemendur</h3>

    <p>Hér kemur nýja nemendastjórnunin.</p>
  </div>
)}
            {adminTab === "teachers" && (
              <div className="bg-card rounded-lg border p-4 mt-4">
                <h3 className="font-bold mb-4">Kennarar</h3>
                <div className="mb-4 space-y-2">
  <input
    type="text"
    placeholder="Nafn kennara"
    value={newTeacherName}
    onChange={(e) => setNewTeacherName(e.target.value)}
    className="border rounded px-3 py-2 w-full"
  />

  <input
    type="email"
    placeholder="Netfang"
    value={newTeacherEmail}
    onChange={(e) => setNewTeacherEmail(e.target.value)}
    className="border rounded px-3 py-2 w-full"
  />

  <input
    type="text"
    placeholder="Lykilorð"
    value={newTeacherPassword}
    onChange={(e) => setNewTeacherPassword(e.target.value)}
    className="border rounded px-3 py-2 w-full"
  />

  <button
    className="px-4 py-2 rounded border"
    onClick={async () => {
  const newTeacher = {
    email: newTeacherEmail,
    password: newTeacherPassword,
    name: newTeacherName,
    role: "teacher" as const,
  };

  const updatedTeachers = [
    ...loadTeachers(),
    newTeacher,
  ];

  saveTeachers(updatedTeachers);

  await saveTeacherToSupabase(newTeacher);

  setNewTeacherName("");
  setNewTeacherEmail("");
  setNewTeacherPassword("");
  setTeacherList(updatedTeachers);
}}

  >
    ➕ Bæta við kennara
  </button>
</div>

                {teachers.map((teacher: (typeof TEACHERS)[number]) => (
                  <div
                    key={teacher.email}
                    className="flex justify-between items-center py-3 border-b"
                  >
                    <div>
                     <div className="font-semibold">{teacher.name}</div>
                     <div className="text-sm text-muted-foreground">
                       {teacher.email}
                      </div>
                     </div>
                    

<div className="flex gap-2">

  <button
  onClick={() => {
    setEditingTeacher(teacher);
    setEditName(teacher.name);
    setEditEmail(teacher.email);
    setEditPassword(teacher.password);
  }}
  className="px-3 py-1 rounded border"
>
  Breyta
</button>
<button
  onClick={() => deleteTeacher(teacher.email)}
  className="px-3 py-1 rounded border text-red-600"
>
  Eyða
</button>
  </div>
</div>
))}
</div>
)}
{editingTeacher && (
  <div className="bg-card border rounded-lg p-4 mb-6">
    <h3 className="font-bold mb-4">
      Breyta kennara
    </h3>

    <div className="space-y-3">

      <input
        value={editName}
        onChange={(e) => setEditName(e.target.value)}
        placeholder="Nafn"
        className="border rounded px-3 py-2 w-full"
      />

      <input
        value={editEmail}
        onChange={(e) => setEditEmail(e.target.value)}
        placeholder="Netfang"
        className="border rounded px-3 py-2 w-full"
      />

      <input
        value={editPassword}
        onChange={(e) => setEditPassword(e.target.value)}
        placeholder="Lykilorð"
        className="border rounded px-3 py-2 w-full"
      />

      <div className="flex gap-2">

        <button
          onClick={async () => {
  const updatedTeacher = {
    name: editName,
    email: editEmail,
    password: editPassword,
    role: editingTeacher.role,
  };

  const updatedTeachers = teacherList.map(
    (t: (typeof TEACHERS)[number]) =>
      t.email === editingTeacher.email
        ? {
            ...t,
            ...updatedTeacher,
          }
        : t
  );

  saveTeachers(updatedTeachers);

  await updateTeacherInSupabase(
    editingTeacher.email,
    updatedTeacher
  );

  setTeacherList(updatedTeachers);
  setEditingTeacher(null);
}}       
          className="px-4 py-2 rounded border"
        >
          Vista
        </button>

        <button
          onClick={() => setEditingTeacher(null)}
          className="px-4 py-2 rounded border"
        >
          Hætta við
        </button>

      </div>
    </div>
  </div>
)}
{adminTab === "students" && (
  <>
<div className="flex items-center gap-3 mb-6"></div>
{false && (
  <div className="bg-card border rounded-lg p-4 mb-6">
    <h3 className="font-bold mb-4">
      Breyta nemanda
    </h3>

    <div className="space-y-3">

      <input
        value={editStudentName}
        onChange={(e) => setEditStudentName(e.target.value)}
        placeholder="Nafn"
        className="border rounded px-3 py-2 w-full"
      />

      <input
        value={editStudentEmail}
        onChange={(e) => setEditStudentEmail(e.target.value)}
        placeholder="Netfang"
        className="border rounded px-3 py-2 w-full"
      />

      <div className="flex gap-2">

        <button
  onClick={async () => {

    const updatedStudent = {
      ...editingStudent!,
      name: editStudentName,
      email: editStudentEmail,
    };

    const updatedStudents = studentList.map((s) =>
      s.email === editingStudent!.email
        ? updatedStudent
        : s
    );

    await updateStudentInSupabase(
      editingStudent!.email,
      updatedStudent
    );

    setStudentList(updatedStudents);
    setEditingStudent(null);

  }}
  className="px-4 py-2 rounded border"
>
  Vista
</button>

        <button
          onClick={() => setEditingStudent(null)}
          className="px-4 py-2 rounded border"
        >
          Hætta við
        </button>

      </div>
    </div>
  </div>
)}
<div className="flex items-center gap-3 mb-6">
  <Users size={20} style={{ color: "#1e3a5f" }} />
  <h1 className="text-xl font-bold" style={{ color: "#1e3a5f" }}>
    Nemendur ({students.length})
  </h1>
</div>

{!editingStudent && (
  <div className="bg-card border rounded-lg p-4 mb-6">
    
  <h3>Bæta við nýjum nemanda</h3>
  <div className="space-y-2">

    <input
      type="text"
      placeholder="Nafn nemanda"
      value={newStudentName}
      onChange={(e) => setNewStudentName(e.target.value)}
      className="border rounded px-3 py-2 w-full"
    />

    <input
      type="email"
      placeholder="Netfang"
      value={newStudentEmail}
      onChange={(e) => setNewStudentEmail(e.target.value)}
      className="border rounded px-3 py-2 w-full"
    />

    <button
      className="px-4 py-2 rounded border"
      onClick={async () => {
  const newStudent = {
    email: newStudentEmail,
    name: newStudentName,
    role: "student",
    completed: [],
  };

  await saveStudentToSupabase(newStudent);

  setNewStudentName("");
  setNewStudentEmail("");

  console.log("Nemandi vistaður:", newStudent);
}}
    >
      ➕ Bæta við nemanda
    </button>
      </div>
      </div>  

)}      
            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Nemendur", value: students.length, icon: <Users size={18} /> },
                {
                  label: "Meðalframvinda",
                  value: `${Math.round(students.reduce((s, u) => {
                    const comp = new Set<LevelKey>(u.completed);
                    const total = CATEGORIES.reduce((t, c) => t + c.sections.length * 3, 0);
                    return s + (u.completed.length / total) * 100;
                  }, 0) / Math.max(students.length, 1))}%`,
                  icon: <BarChart3 size={18} />,
                },
                {
                  label: "Flestir flokkar",
                  value: Math.max(0, ...students.map((u) => {
                    const comp = new Set<LevelKey>(u.completed);
                    return CATEGORIES.filter((c) => categoryProgress(comp, c.id).done > 0).length;
                  })),
                  icon: <BookOpen size={18} />,
                },
                {
                  label: "Flestar lokningar",
                  value: Math.max(0, ...students.map((u) => u.completed.length)),
                  icon: <Award size={18} />,
                },
              ].map((stat) => (
                <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
                  <div className="text-muted-foreground mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold" style={{ color: "#1e3a5f" }}>{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Student table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="grid grid-cols-[1fr,repeat(7,auto)] gap-0 text-xs font-semibold text-muted-foreground border-b border-border px-5 py-3 overflow-x-auto">
                <div>Nemandi</div>
                {CATEGORIES.map((c) => (
                  <div key={c.id} className="text-center px-2" style={{ minWidth: 36, color: c.accentColor }} title={c.name}>
                    {c.icon}
                  </div>
                ))}
              </div>
              {students.map((student, idx) => {
                const comp = new Set<LevelKey>(student.completed);
                return (
                  <div key={student.email} onClick={() => setSelected(student.email)}
                    className={`w-full text-left grid grid-cols-[1fr,repeat(7,auto)] gap-0 px-5 py-3.5 hover:bg-muted/40 transition-colors ${idx < students.length - 1 ? "border-b border-border" : ""}`}>
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: "#1e3a5f" }}>
                        {student.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm truncate">{student.name}</div>
                        <div className="text-xs text-muted-foreground truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
                          {student.email}
                        </div>
<button
  onClick={(e) => {
    e.stopPropagation();

    console.log("Breyta smellt", student);

    setEditingStudent(student);
    setEditStudentName(student.name);
    setEditStudentEmail(student.email);
  }}
  className="mt-1 mr-2 px-2 py-1 rounded border text-xs"
>
  Breyta
</button>
                        <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteStudent(student.email);
                        }}
                        className="mt-1 px-2 py-1 rounded bg-red-600 text-white text-xs"
                        >
                          Eyða
                          </button>
                      </div>
                    </div>
                    {editingStudent?.email === student.email && (
  <div className="col-span-full mt-4 border rounded-lg p-4 bg-white">
    <h3 className="font-bold mb-4">
      Breyta nemanda
    </h3>

    <input
      value={editStudentName}
      onChange={(e) => setEditStudentName(e.target.value)}
      className="border rounded px-3 py-2 w-full mb-3"
      placeholder="Nafn"
    />

    <input
      value={editStudentEmail}
      onChange={(e) => setEditStudentEmail(e.target.value)}
      className="border rounded px-3 py-2 w-full mb-3"
      placeholder="Netfang"
    />

    <div className="flex gap-2">
      <button
        onClick={async () => {

          const updatedStudent = {
            ...editingStudent,
            name: editStudentName,
            email: editStudentEmail,
          };

          const updatedStudents = studentList.map((s) =>
            s.email === editingStudent.email
              ? updatedStudent
              : s
          );

          await updateStudentInSupabase(
            editingStudent.email,
            updatedStudent
          );

          setStudentList(updatedStudents);
          setEditingStudent(null);
        }}
        className="px-4 py-2 rounded border"
      >
        Vista
      </button>

      <button
        onClick={() => setEditingStudent(null)}
        className="px-4 py-2 rounded border"
      >
        Hætta við
      </button>
    </div>
  </div>
)}
                  
                    {CATEGORIES.map((c) => {
                      const { done, total } = categoryProgress(comp, c.id);
                      const pct = Math.round((done / total) * 100);
                      return (
                        <div key={c.id} className="flex items-center justify-center px-2" style={{ minWidth: 36 }}>
                          {done === total ? (
                            <CheckCircle2 size={14} className="text-emerald-500" />
                          ) : done > 0 ? (
                            <div className="relative w-7 h-7">
                              <svg viewBox="0 0 28 28" className="w-full h-full -rotate-90">
                                <circle cx="14" cy="14" r="11" fill="none" stroke="#ede9e3" strokeWidth="3" />
                                <circle cx="14" cy="14" r="11" fill="none" stroke={c.accentColor} strokeWidth="3"
                                  strokeDasharray={`${(pct / 100) * 69.1} 69.1`} strokeLinecap="round" />
                              </svg>
                              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold"
                                style={{ color: c.accentColor }}>{pct}%</span>
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-muted" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </>
        )}
         </>
      )}
      </main>
    </div>
  );
}

// ─── App (main router) ────────────────────────────────────────────────────────
export default function App() {
  const [users, setUsers] = useState<Record<string, UserData>>(initUsers);
  const [currentUser, setCurrentUser] = useState<UserData | null>(() => {
    try {
      const s = localStorage.getItem("delta_current_user");
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });
  const [view, setView] = useState<ViewType>(() => {
    try {
      const s = localStorage.getItem("delta_current_user");
      if (s) {
        const u = JSON.parse(s);
        return u.role === "teacher" ? "teacher" : "dashboard";
      }
    } catch {}
    return "login";
  });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeLevel, setActiveLevel] = useState<{ catId: string; secId: string; level: Level } | null>(null);

  const completed = useMemo<Set<LevelKey>>(() => {
    if (!currentUser) return new Set();
    return new Set<LevelKey>(users[currentUser.email]?.completed || []);
  }, [currentUser, users]);
const login = (email: string, pass: string): string | null => {
 const teacherAccount = loadTeachers().find(
  (t: (typeof TEACHERS)[number]) => t.email === email
);

if (teacherAccount) {
  if (pass !== teacherAccount.password) {
    return "Rangt lykilorð fyrir kennarareikning";
  }

  const teacher: UserData = {
  email: teacherAccount.email,
  name: teacherAccount.name,
  role: teacherAccount.role,
  completed: [],
};

  setCurrentUser(teacher);
  localStorage.setItem("delta_current_user", JSON.stringify(teacher));
  setView("teacher");
  return null;
}
    // Student: create or load
    const existing = users[email];
    const user: UserData = existing ?? { email, name: email.split("@")[0], role: "student", completed: [] };
    if (!existing) {
      const updated = { ...users, [email]: user };
      setUsers(updated);
      saveUsers(updated);
    }
    setCurrentUser(user);
    localStorage.setItem("delta_current_user", JSON.stringify(user));
    setView("dashboard");
    return null;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("delta_current_user");
    setView("login");
    setSelectedCategory(null);
    setActiveLevel(null);
  };

  const completeLevel = (catId: string, secId: string, level: Level) => {
    if (!currentUser) return;
    const key = lk(catId, secId, level);
    const cur = users[currentUser.email];
    if (!cur) return;
    const newCompleted = Array.from(new Set([...cur.completed, key]));
    const updated = { ...users, [currentUser.email]: { ...cur, completed: newCompleted } };
    setUsers(updated);
    saveUsers(updated);
  };

  if (view === "login") return <LoginView onLogin={login} />;

 if (view === "teacher")
  return (
    <TeacherView
      users={users}
      setUsers={setUsers}
      onLogout={logout}
      currentUser={currentUser!}
    />
  )

  if (view === "level" && activeLevel) {
    const cat = CATEGORIES.find((c) => c.id === activeLevel.catId)!;
    const sec = cat.sections.find((s) => s.id === activeLevel.secId)!;
    return (
      <LevelView
        category={cat}
        section={sec}
        level={activeLevel.level}
        isCompleted={completed.has(lk(activeLevel.catId, activeLevel.secId, activeLevel.level))}
        onComplete={() => completeLevel(activeLevel.catId, activeLevel.secId, activeLevel.level)}
        onBack={() => setView("category")}
      />
    );
  }

  if (view === "category" && selectedCategory) {
    const cat = CATEGORIES.find((c) => c.id === selectedCategory)!;
    return (
      <CategoryView
        category={cat}
        completed={completed}
        onBack={() => setView("dashboard")}
        onSelectLevel={(catId, secId, level) => {
          setActiveLevel({ catId, secId, level });
          setView("level");
        }}
      />
    );
  }

  return (
    <DashboardView
      user={currentUser!}
      completed={completed}
      onSelectCategory={(id) => { setSelectedCategory(id); setView("category"); }}
      onLogout={logout}
    />
  );
}
