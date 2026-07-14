import React, { useState, useMemo } from "react";
import {
  Lock,
  CheckCircle2,
  LogOut,
  ArrowLeft,
  ChevronRight,
  BookOpen,
  Eye,
  EyeOff,
} from "lucide-react";
import { LEVELS, LEVEL_META, CategoryData, SectionData, CATEGORIES, } from "../Data/categories";
// ─── Types ───────────────────────────────────────────────────────────────────
import {
  Level,
  LevelKey,
  ViewType,
  UserData,
} from "../lib/types";
// ─── Constants ───────────────────────────────────────────────────────────────
// ─── Prerequisite System ─────────────────────────────────────────────────────
import {
  lk,
  isUnlocked,
  categoryProgress,
} from "../lib/progress";
// ─── Teacher View ─────────────────────────────────────────────────────────────
import TeacherView from "./components/TeacherView";
// ─── Dashboard View ───────────────────────────────────────────────────────────
import DashboardView from "./components/DashboardView";
// ─── Category View ───────────────────────────────────────────────────────────
import CategoryView from "./components/CategoryView";
// ─── Storage / Auth ───────────────────────────────────────────────────────────
import {
  loadTeachers,
  loadUsers,
  saveUsers,
} from "../lib/storage";
type TeacherRole = "teacher" | "admin";
const TEACHERS: {
  email: string;
  password: string;
  name: string;
  role: TeacherRole;
}[] = [
  {
    email: "admin@delta.is",
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
function initUsers(): Record<string, UserData> {
  const stored = loadUsers();
  if (Object.keys(stored).length > 0) return stored;
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
              { icon: "δ β α", label: "Þrjú stig", desc: "Delta · Beta · Alpha" },
              { icon: "7", label: "Sjö flokkar", desc: "Frá talnaskilningi - fjármála" },
              { icon: "🔓", label: "Kerfisbundið", desc: "Þú kemst hærra með því að klára hvern flokk" },
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
          Kennari? Notaðu: kennari@delta.is
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

// ─── Section Node (tree cell) ─────────────────────────────────────────────────

// ─── Category View ────────────────────────────────────────────────────────────
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

 const completed = currentUser
  ? users[currentUser.email]?.completed || []
  : [];
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
        isCompleted={completed.includes(lk(activeLevel.catId, activeLevel.secId, activeLevel.level))}
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
if (!currentUser) return null;
  return (
    <DashboardView
     users={users}
     setUsers={setUsers}
     currentUser={currentUser}
     onSelectCategory={(id) => {
  setSelectedCategory(id);
  setView("category");
}}
     onLogout={logout}
     
/>
  );
}
