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

}: StudentManagementProps) {
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
  onClick={() => deleteStudent(student.email)}
  className="px-3 py-1 rounded border text-red-600"
>
  Eyða
</button>
             
        <div className="text-sm text-muted-foreground">
          <button
  className="text-sm text-blue-600 hover:underline"
>
  Skoða framvindu →
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
              className="px-4 py-2 rounded border"
              onClick={async () => {
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

              
              }}
            >
              {editingStudent
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
