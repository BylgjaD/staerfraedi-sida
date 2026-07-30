import { UserData } from "../../lib/types";
import { useEffect, useState } from "react";

import {
  saveTeacherToSupabase,
  updateTeacherInSupabase,
  deleteTeacherFromSupabase,
  loadStudentsForTeacher,
  saveStudentToSupabase,
  updateStudentInSupabase,
  deleteStudentFromSupabase,
  loadTeachersFromProfiles, 
  setUserActive,
  loadAllStudents,
  assignStudentToTeacher,
} from "../../lib/supabase";

import TeacherDashboard from "./TeacherDashboard";
import AdminDashboard from "./AdminDashboard";
import { LogOut, GraduationCap } from "lucide-react";
import StudentManagement from "./StudentManagement";
import TeacherManagement from "./TeacherManagement";
import ProgressModal from "./ProgressModal";


interface TeacherViewProps {
  users: Record<string, UserData>;
  setUsers: React.Dispatch<React.SetStateAction<Record<string, UserData>>>;
  onLogout: () => void;
  currentUser: UserData;
}
export default function TeacherView({
  users,
  setUsers,
  onLogout,
  currentUser,
}: TeacherViewProps) {
    const [selected, setSelected] = useState<string | null>(null); 
    const [previewCategory, setPreviewCategory] = useState<string | null>(null); 
    const [teacherList, setTeacherList] = useState<any[]>([]);
    useEffect(() => {
      loadTeachersFromProfiles().then(setTeacherList);
    }, []);
    const [studentList, setStudentList] = useState<UserData[]>([]);
    const [editingTeacher, setEditingTeacher] =
       useState<UserData | null>(null);
    const [editingStudent, setEditingStudent] =
       useState<UserData | null>(null);
    const [assigningStudent, setAssigningStudent] = useState<UserData | null>(null);
    const [selectedTeacherId, setSelectedTeacherId] = useState("");
    
    const [editStudentName, setEditStudentName] = useState("");
    const [editStudentEmail, setEditStudentEmail] = useState("");
    const [editName, setEditName] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editPassword, setEditPassword] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<UserData | null>(null);
      
    useEffect(() => {
  if (currentUser.role === "admin") {
    loadAllStudents().then((data) => {
      setStudentList(data as UserData[]);
    });
  } else {
    loadStudentsForTeacher(currentUser.id).then((data) => {
      setStudentList(data as UserData[]);
    });
  }
}, [currentUser]);
    
      const isAdmin = currentUser.role === "admin";
      const [adminTab, setAdminTab] = useState<"students" | "teachers">("students");
      const [newTeacherName, setNewTeacherName] = useState("");
     
    const [newTeacherEmail, setNewTeacherEmail] = useState("");
    const [newTeacherPassword, setNewTeacherPassword] = useState("");
    const [newStudentName, setNewStudentName] = useState("");
    const [newStudentEmail, setNewStudentEmail] = useState("");
    const [editStudentPassword, setEditStudentPassword] = useState("");
    
    const deleteStudent = async (email: string) => {
      if (!window.confirm("Ertu viss um að þú viljir eyða þessum nemanda?")) {
        return;
      }

  await deleteStudentFromSupabase(email);

  setStudentList((prev) =>
    prev.filter((s) => s.email !== email)
  );
};
  const deleteTeacher = async (id: string) => {
  if (!window.confirm("Ertu viss um að þú viljir eyða þessum kennara?")) {
    return;
  }   
   const updatedTeachers = teacherList.filter((t) => t.id !== id);


  setTeacherList(updatedTeachers);

  
  setTeacherList((prev) => prev.filter((t) => t.id !== id));
};
return (
  <div className="min-h-screen bg-background" style={{ fontFamily: 
    "'Outfit', sans-serif" }}>
  
  <header className="sticky top-0 z-20 bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
<div className="flex items-center gap-3">
            <span className="text-2xl font-bold" style={{ color: "#c8952a" }}>Δ</span>
            <span className="font-bold text-sm" style={{ color: "#1e3a5f" }}>DELTA</span>
            {!isAdmin && (
              <div
              className="hidden sm:flex items-center gap-1.5 ml-2 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: "#1e3a5f15", color: "#1e3a5f" }}
              >
                <GraduationCap size={12} /> Kennari
                </div>
              )}
            {isAdmin && (
              <div className="flex items-center gap-3">
                <div
      className="ml-2 px-2 py-1 rounded text-xs font-semibold"
      style={{ background: "#fbbf24", color: "#000" }}
       >
      👑 Admin
    </div>

    <button
      onClick={() => setAdminTab("students")}
      className="px-2 py-1 rounded text-xs border"
    >
      Nemendur
    </button>

    <button
      onClick={() => setAdminTab("teachers")}
      className="px-2 py-1 rounded text-xs border"
    >
      Kennarar
    </button>
  </div>
)}
</div>
          <button onClick={onLogout}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <LogOut size={15} /> <span className="hidden sm:inline">Útskrá</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {isAdmin ? (
          <>
            <div className="mb-6 flex gap-2">
              <button
                onClick={() => setAdminTab("students")}
                className="px-3 py-2 rounded border"
              >
                Nemendur
              </button>
              <button
                onClick={() => setAdminTab("teachers")}
                className="px-3 py-2 rounded border"
              >
                Kennarar
              </button>
            </div>
            

           {adminTab === "students" && (
  <StudentManagement
    currentUser={currentUser}
    studentList={studentList}
    setStudentList={setStudentList}

    teacherList={teacherList}

    assigningStudent={assigningStudent}
    setAssigningStudent={setAssigningStudent}

    selectedTeacherId={selectedTeacherId}
    setSelectedTeacherId={setSelectedTeacherId}

    newStudentName={newStudentName}
    setNewStudentName={setNewStudentName}
    newStudentEmail={newStudentEmail}
    setNewStudentEmail={setNewStudentEmail}
    editingStudent={editingStudent}
    setEditingStudent={setEditingStudent}
    editStudentName={editStudentName}
    setEditStudentName={setEditStudentName}
    editStudentEmail={editStudentEmail}
    setEditStudentEmail={setEditStudentEmail}
    saveStudentToSupabase={saveStudentToSupabase}
    updateStudentInSupabase={updateStudentInSupabase}
    deleteStudent={deleteStudent}
    editStudentPassword={editStudentPassword}
    setEditStudentPassword={setEditStudentPassword}
    assignStudentToTeacher={assignStudentToTeacher}
    selectedStudent={selectedStudent}
    setSelectedStudent={setSelectedStudent}
  />
)}

            {adminTab === "teachers" && (
              <TeacherManagement
                teacherList={teacherList}
                newTeacherName={newTeacherName}
                setNewTeacherName={setNewTeacherName}
                newTeacherEmail={newTeacherEmail}
                setNewTeacherEmail={setNewTeacherEmail}
                newTeacherPassword={newTeacherPassword}
                setNewTeacherPassword={setNewTeacherPassword}
                saveTeacherToSupabase={saveTeacherToSupabase}
                setTeacherList={setTeacherList}
                setEditingTeacher={setEditingTeacher}
                setEditName={setEditName}
                setEditEmail={setEditEmail}
                setEditPassword={setEditPassword}
                editName={editName}
                editEmail={editEmail}
                editPassword={editPassword}
                editingTeacher={editingTeacher}
                updateTeacherInSupabase={updateTeacherInSupabase}
                setUserActive={setUserActive}
                deleteTeacher={deleteTeacher}
              />
            )}
          </>
        ) : (
          <TeacherDashboard
            currentUser={currentUser}
            studentsContent={
              <StudentManagement
                currentUser={currentUser}
                studentList={studentList}
                setStudentList={setStudentList}
                newStudentName={newStudentName}
                setNewStudentName={setNewStudentName}
                newStudentEmail={newStudentEmail}
                setNewStudentEmail={setNewStudentEmail}
                editingStudent={editingStudent}
                setEditingStudent={setEditingStudent}
                editStudentName={editStudentName}
                setEditStudentName={setEditStudentName}
                editStudentEmail={editStudentEmail}
                setEditStudentEmail={setEditStudentEmail}
                saveStudentToSupabase={saveStudentToSupabase}
                updateStudentInSupabase={updateStudentInSupabase}
                deleteStudent={deleteStudent}
                editStudentPassword={editStudentPassword}
                setEditStudentPassword={setEditStudentPassword}

                teacherList={teacherList}
                assigningStudent={assigningStudent}
                setAssigningStudent={setAssigningStudent}
                selectedTeacherId={selectedTeacherId}
                setSelectedTeacherId={setSelectedTeacherId}
                assignStudentToTeacher={assignStudentToTeacher}
                selectedStudent={selectedStudent}
                setSelectedStudent={setSelectedStudent}
              />
            }
          />
        )}
      </main>
      {selectedStudent && (
  <ProgressModal
      student={selectedStudent}
      onClose={() => setSelectedStudent(null)}
  />
)}
    </div>
  );
}
