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
  const { data, error } = await supabase
    .from("students")
    .insert([student])
    .select();

  console.log("INSERT DATA:", data);

  if (error) {
    console.error("SUPABASE ERROR:", error);
    alert(error.message);
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
}
export async function updateStudentInSupabase(
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
export async function getStudentByEmail(email: string) {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    return null;
  }
  return data;
}
export async function getTeacherByEmail(email: string) {
  const { data, error } = await supabase
    .from("teachers")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.error("getTeacherByEmail villa:", error);
    return null;
  }
  return data;
}
export async function loadNotesFromSupabase(teacherEmail: string) {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("teacher_email", teacherEmail)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

export async function saveNoteToSupabase(note: any) {
  const { data, error } = await supabase
    .from("notes")
    .insert([note])
    .select();

  if (error) {
    console.error("SUPABASE ERROR:", error);
    alert(error.message);
  }

  return data;
}

export async function deleteNoteFromSupabase(id: string) {
  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
  }
}

export async function uploadNoteImage(file: File) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;

  const { error } = await supabase.storage
    .from("note-images")
    .upload(fileName, file);

  if (error) {
    console.error("UPLOAD ERROR:", error);
    return null;
  }

  const { data } = supabase.storage.from("note-images").getPublicUrl(fileName);
  return data.publicUrl;
}
// Kennaraglósur fyrir ákveðinn kafla (student_email er null)
export async function loadTeacherNotesForSection(categoryId: string, sectionId: string) {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("category_id", categoryId)
    .eq("section_id", sectionId)
    .is("student_email", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }
  return data;
}

// Nemandans eigin glósur, valfrjálst síaðar eftir kafla
export async function loadStudentNotes(studentEmail: string, categoryId?: string, sectionId?: string) {
  let query = supabase
    .from("notes")
    .select("*")
    .eq("student_email", studentEmail);

  if (categoryId) query = query.eq("category_id", categoryId);
  if (sectionId) query = query.eq("section_id", sectionId);

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }
  return data;
}
export async function loadStudentsForTeacher(teacherId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "student")
    .eq("teacher_id", teacherId);

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}
