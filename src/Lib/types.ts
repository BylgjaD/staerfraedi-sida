export type Level = "δ" | "β" | "α";

export type LevelKey = string;

export type ViewType =
  | "login"
  | "id"
  | "dashboard"
  | "category"
  | "level"
  | "teacher";

export interface UserData {
  id: string;
  email: string;
  password:string;
  name: string;
  role: "student" | "teacher" | "admin";
  teacher_id: string | null;
  completed: LevelKey[];
}