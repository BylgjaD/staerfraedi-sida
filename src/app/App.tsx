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
import { LEVELS, LEVEL_META, CategoryData, SectionData, CATEGORIES, } from "../data/categories";
// ─── Types ───────────────────────────────────────────────────────────────────
import {
  Level,
  LevelKey,
  ViewType,
  UserData,
} from "../lib/types";

import {
  loadStudentsFromSupabase,
  saveStudentToSupabase,
  getStudentByEmail,
  getTeacherByEmail,
} from "../lib/supabase";

import { supabase } from "../lib/supabase";

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
function initUsers(): Record<string, UserData> {
  return {};
}
// ─── Login View ───────────────────────────────────────────────────────────────
import LoginView from "./components/LoginView";

// ─── Section Node (tree cell) ─────────────────────────────────────────────────

// ─── Category View ────────────────────────────────────────────────────────────
// ─── Level View ───────────────────────────────────────────────────────────────
import LevelView from "./components/LevelView";
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
        const isTeacher =
  u.role === "teacher" || u.role === "admin";

    return isTeacher ? "teacher" : "dashboard";
      }
    } catch {}
    return "login";
  });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeLevel, setActiveLevel] = useState<{ catId: string; secId: string; level: Level } | null>(null);

 const completed = currentUser
  ? users[currentUser.email]?.completed || []
  : [];
 
const login = async (email: string, pass: string): Promise<string | null> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
  });

  if (error || !data.user) {
    return "Rangt netfang eða lykilorð";
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (profileError || !profile) {
    return "Fann ekki notandaprófíl";
  }
  if (!profile.active) {
  await supabase.auth.signOut(); // ógilda session-ið sem signInWithPassword bjó til
  return "Þessi notandi er óvirkur. Hafðu samband við stjórnanda.";
}

  const userData: UserData = {
    id: data.user.id,
    email: data.user.email!,
    name: profile.name,
    role: profile.role,
      teacher_id: profile.teacher_id ?? null,
    completed: [],
    password: "",
  };

  setCurrentUser(userData);
  localStorage.setItem("delta_current_user", JSON.stringify(userData));
  setView(profile.role === "teacher" || profile.role === "admin" ? "teacher" : "dashboard");
  return null;
};

const logout = async() => {
   await supabase.auth.signOut();
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
        currentUser={currentUser!}
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
  console.log("VIEW =", view);
console.log("ROLE =", currentUser?.role);
if (!currentUser) return null;
  return (
    <DashboardView
     users={users}
     setUsers={setUsers}
     currentUser={currentUser!}
     onSelectCategory={(id) => {
  setSelectedCategory(id);
  setView("category");
}}
     onLogout={logout}
     
/>
  );
}
