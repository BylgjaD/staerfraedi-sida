import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://atgdujnivhcjcdkvcxma.supabase.co";

const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0Z2R1am5pdmhjamNka3ZjeG1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyOTU1OTcsImV4cCI6MjA5Nzg3MTU5N30.bVYzR5lb0Z9Xs2u8uKRqSgx6pQAwsoppXeyLKrkZ2gE";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
export async function loadTeachersFromSupabase() {
  const { data, error } = await supabase
    .from("teachers")
    .select("*");

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

export async function saveTeacherToSupabase(teacher: any) {
  const { error } = await supabase
    .from("teachers")
    .insert([teacher]);

  if (error) {
    console.error(error);
  }
}

export async function deleteTeacherFromSupabase(email: string) {
  const { error } = await supabase
    .from("teachers")
    .delete()
    .eq("email", email);

  if (error) {
    console.error(error);
  }
}
export async function updateTeacherInSupabase(
  oldEmail: string,
  teacher: any
) {
  const { error } = await supabase
    .from("teachers")
    .update(teacher)
    .eq("email", oldEmail);

  if (error) {
    console.error(error);
  }
}
export async function loadStudentsFromSupabase() {
  const { data, error } = await supabase
    .from("students")
    .select("*");

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

export async function saveStudentToSupabase(student: any) {
  const { error } = await supabase
    .from("students")
    .insert([student]);

  if (error) {
    console.error(error);
  }
}

export async function deleteStudentFromSupabase(email: string) {
  const { error } = await supabase
    .from("students")
    .delete()
    .eq("email", email);

  if (error) {
    console.error(error);
  }
}export async function updateStudentInSupabase(
  oldEmail: string,
  student: any
) {
  const { error } = await supabase
    .from("students")
    .update(student)
    .eq("email", oldEmail);

  if (error) {
    console.error(error);
  }
}