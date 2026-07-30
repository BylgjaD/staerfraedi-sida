import { useState } from "react";
import { Users } from "lucide-react";
import { UserData } from "../../lib/types";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "../../lib/supabase";


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

     {studentList.map((student) => (
  <div key={student.email} className="bg-card border rounded-lg p-4 mb-4">
    <div className="flex justify-between items-center">
      <div>
        <div className="font-semibold">{student.name}</div>
        <div className="text-sm">{student.email}</div>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            setEditingStudent(student);
            setEditStudentName(student.name);
            setEditStudentEmail(student.email);
          }}
          
          className="px-3 py-1 rounded border h-fit"
        >
          Breyta
        </button>
        <button
  onClick={() => {
    setAssigningStudent(student);
    setSelectedTeacherId(student.teacher_id || "");
  }}
  className="px-3 py-1 rounded border"
>
  Tengja við kennara
</button>

{assigningStudent?.id === student.id && (
  <div className="mt-3 border-t pt-3">
    <select
      value={selectedTeacherId}
      onChange={(e) => setSelectedTeacherId(e.target.value)}
      className="border rounded px-2 py-1"
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
  
  await assignStudentToTeacher(
    assigningStudent.id,
    selectedTeacherId
  );

  setStudentList((prev) =>
    prev.map((student) =>
      student.id === assigningStudent.id
        ? { ...student, teacher_id: selectedTeacherId }
        : student
    )
  );

  setAssigningStudent(null);
}}
  
>
  Vista
</button>

    <button
      onClick={() => setAssigningStudent(null)}
      className="ml-2 px-3 py-1 rounded border"
    >
      Hætta við
    </button>
  </div>
)}

<button
  onClick={() => deleteStudent(student.email)}
  className="px-3 py-1 rounded border text-red-600"
>
  Eyða
</button>
             
        <div className="text-sm text-muted-foreground">
          <button
  className="text-sm text-blue-600 hover:underline"

  onClick={() => setSelectedStudent(student)}
>
    📊 Skoða framvindu →
</button>
</div>

      </div>
    </div>
  </div>
))}
 
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
  
