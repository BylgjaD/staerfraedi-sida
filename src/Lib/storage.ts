import { UserData } from "./types";
import { TEACHERS, Teacher } from "../data/teachers";

export function loadTeachers(): Teacher[] {
  const stored = localStorage.getItem("delta_teachers");

  if (stored) {
    return JSON.parse(stored);
  }

  localStorage.setItem("delta_teachers", JSON.stringify(TEACHERS));
  return TEACHERS;
}

export function saveTeachers(teachers: Teacher[]) {
  localStorage.setItem("delta_teachers", JSON.stringify(teachers));
}

export function loadUsers(): Record<string, UserData> {
  try {
    const s = localStorage.getItem("delta_users");
    return s ? JSON.parse(s) : {};
  } catch {
    return {};
  }
}

export function saveUsers(users: Record<string, UserData>) {
  localStorage.setItem("delta_users", JSON.stringify(users));
}
