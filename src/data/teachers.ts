export type TeacherRole = "teacher" | "admin";

export interface Teacher {
  email: string;
  password: string;
  name: string;
  role: TeacherRole;
}

export const TEACHERS: Teacher[] = [
  {
    email: "admin@delta.is",
    password: "Skoli123",
    name: "Bylgja",
    role: "admin",
  },
  {
    email: "arna@delta.is",
    password: "arna123",
    name: "Arna",
    role: "teacher",
  },
  {
    email: "bylgja@delta.is",
    password: "bylgja123",
    name: "Bylgja",
    role: "teacher",
  },
];