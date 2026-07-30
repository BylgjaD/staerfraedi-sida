import { useState } from "react";
import { Users } from "lucide-react";
import { UserData } from "../../lib/types";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { setUserActive } from "../../lib/supabase";


interface StudentManagementProps {
    studentList: any[];
    editStudentName:string;
    setEditStudentName:React.Dispatch<React.SetStateAction<string>>;
    editStudentEmail:string;
    setEditStudentEmail:React.Dispatch<React.SetStateAction<string>>;
    editingStudent:any | null;
    setEditingStudent:React.Dispatch<React.SetStateAction<any | null>>;
    setStudentList:React.Dispatch<React.SetStateAction<any[]>>;
    updateStudentInSupabase:(oldEmail:string, student:any) => Promise<void>;
    saveStudentToSupabase: (student: any) => Promise<void>;
    newStudentName: string;
    setNewStudentName: React.Dispatch<React.SetStateAction<string>>;
    newStudentEmail: string;
    setNewStudentEmail: React.Dispatch<React.SetStateAction<string>>;
    deleteStudent: (email: string) => Promise<void>;
    editStudentPassword: string;
    setEditStudentPassword: React.Dispatch<React.SetStateAction<string>>;
    currentUser: UserData;

    teacherList: UserData[];
    assigningStudent: UserData | null;
    setAssigningStudent: React.Dispatch<React.SetStateAction<UserData | null>>;
    selectedTeacherId: string;
    setSelectedTeacherId: React.Dispatch<React.SetStateAction<string>>;
    assignStudentToTeacher: (studentId: string,teacherId: string | null) => Promise<void>;
    selectedStudent: UserData | null;
    setSelectedStudent: React.Dispatch<React.SetStateAction<UserData | null>>;
  }

export default function StudentManagement({
  studentList,
  setEditStudentName,
  setEditStudentEmail,
  editStudentName,
  editStudentEmail,
  setEditingStudent,
  setStudentList,
  updateStudentInSupabase,
  saveStudentToSupabase,
  setNewStudentName,
  setNewStudentEmail,
  newStudentName,
  newStudentEmail,
  deleteStudent,
  editingStudent,
  setEditStudentPassword,
  editStudentPassword,
  currentUser,
  teacherList,
 assigningStudent,
 setAssigningStudent,
 selectedTeacherId,
 setSelectedTeacherId,
assignStudentToTeacher,
selectedStudent,
setSelectedStudent,

}: StudentManagementProps) {
  const [saving, setSaving] = useState(false); 
  const cancelEdit = () => {
    if (editingStudent) {
      setEditingStudent(null);
      setEditStudentName("");
      setEditStudentEmail("");
    } else {
      setNewStudentName("");
      setNewStudentEmail("");
    }
  };
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Users size={20} style={{ color: "#1e3a5f" }} />
        <h1 className="text-xl font-bold" style={{ color: "#1e3a5f" }}>
          Nemendur ({studentList.length})
        </h1>
      </div>

    {studentList.map((student) => {
  const assignedTeacher = teacherList.find((t) => t.id === student.teacher_id);

  return (
    <div key={student.email} className="bg-card border rounded-xl p-4 mb-4">
      <div className="flex items-start justify-between mb-1">
        <div className="font-semibold text-base">{student.name}</div>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            student.active === false
              ? "bg-gray-100 text-gray-500"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {student.active === false ? "Óvirkur" : "Virkur"}
        </span>
      </div>

      <div className="text-sm text-muted-foreground mb-1">{student.email}</div>

      {assignedTeacher && (
        <div className="text-sm text-muted-foreground mb-3">
          Kennari: {assignedTeacher.name}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 pt-3 border-t mt-3">
        <button
          onClick={() => {
            setEditingStudent(student);
            setEditStudentName(student.name);
            setEditStudentEmail(student.email);
          }}
          className="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50"
        >
          Breyta
        </button>

        <button
          onClick={() => {
            setAssigningStudent(student);
            setSelectedTeacherId(student.teacher_id || "");
          }}
          className="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50"
        >
          Tengja við kennara
        </button>

        <button
  onClick={async () => {
    const newActiveState = student.active === false ? true : false;
    await setUserActive(student.id, newActiveState);
    setStudentList((prev) =>
      prev.map((s) => (s.id === student.id ? { ...s, active: newActiveState } : s))
    );
  }}
  className="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50"
>
  {student.active === false ? "Gera virkan" : "Gera óvirkan"}
</button>

        <button
          onClick={() => setSelectedStudent(student)}
          className="px-3 py-1.5 rounded-lg border text-sm text-blue-600 hover:bg-blue-50"
        >
          📊 Skoða framvindu
        </button>

        <button
          onClick={() => deleteStudent(student.email)}
          className="ml-auto px-3 py-1.5 rounded-lg border text-sm text-red-600 hover:bg-red-50"
        >
          Eyða
        </button>
      </div>

      {assigningStudent?.id === student.id && (
        <div className="mt-3 pt-3 border-t flex items-center gap-2">
          <select
            value={selectedTeacherId}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
            className="border rounded-lg px-2 py-1.5 text-sm"
          >
            <option value="">Veldu kennara</option>
            {teacherList.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name}
              </option>
            ))}
          </select>

          <button
            onClick={async () => {
              if (!assigningStudent || !selectedTeacherId) return;

              await assignStudentToTeacher(assigningStudent.id, selectedTeacherId);

              setStudentList((prev) =>
                prev.map((s) =>
                  s.id === assigningStudent.id ? { ...s, teacher_id: selectedTeacherId } : s
                )
              );

              setAssigningStudent(null);
            }}
            className="px-3 py-1.5 rounded-lg border text-sm bg-blue-600 text-white"
          >
            Vista
          </button>

          <button
            onClick={() => setAssigningStudent(null)}
            className="px-3 py-1.5 rounded-lg border text-sm"
          >
            Hætta við
          </button>
        </div>
      )}
    </div>
  );
})}
 
      <div className="bg-card border rounded-lg p-4 mb-6">
        <h3 className="font-bold mb-4">
          {editingStudent
             ? "Breyta nemanda"
               : "Bæta við nýjum nemanda"}
                                          </h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Nafn nemanda"
            value={editingStudent ? editStudentName : newStudentName}
            onChange={(e) =>
             editingStudent
               ? setEditStudentName(e.target.value)
               : setNewStudentName(e.target.value)
}
            className="border rounded px-3 py-2 w-full"
          />

          <input
            type="email"
            placeholder="Netfang"
            value={editingStudent ? editStudentEmail : newStudentEmail}
            onChange={(e) =>
              editingStudent
                ? setEditStudentEmail(e.target.value)
                : setNewStudentEmail(e.target.value)
            }
            className="border rounded px-3 py-2 w-full"
          />

          <input
           placeholder="Lykilorð"
            type="password"
            value={editStudentPassword}
            onChange={(e) => setEditStudentPassword(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />

          <div className="flex gap-2">
           <button
           disabled={saving}
           className="px-4 py-2 rounded border disabled:opacity-50"
           onClick={async () => {
             setSaving(true);
                
             if (editingStudent) {
               const updatedStudent = {
                ...editingStudent,
                 name: editStudentName,
                 email: editStudentEmail,
          };
          const updatedStudentsList = studentList.map((s) =>
        s.email === editingStudent.email ? updatedStudent : s
      );
      setStudentList(updatedStudentsList);
      await updateStudentInSupabase(editingStudent.email, updatedStudent);

      cancelEdit();
          
      } else {
  const { data, error } = await supabase.functions.invoke("create-user", {
    body: {
      email: newStudentEmail,
      password: editStudentPassword,
      name: newStudentName,
      role: "student",
    },
  });

  if (error || data?.error) {
    alert(data?.error || error?.message || "Villa við að búa til nemanda");
  } else {
    const newStudent = {
      id: data.id,
      email: newStudentEmail,
      name: newStudentName,
      role: "student",
      completed: [],
      teacher_email: currentUser.email,
    };

    setStudentList([...studentList, newStudent]);
    setNewStudentName("");
    setNewStudentEmail("");
    setEditStudentPassword("");
  }
}  
  setSaving(false);         

              
              }}
            >
               {saving
    ? "Vistar..."
              :editingStudent
  ? "💾 Vista breytingar"
  : "➕ Bæta við nemanda"}
            </button>

            <button
              className="px-4 py-2 rounded border"
                 onClick={cancelEdit}
            >
              Hætta við
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  }
  
