import { Users } from "lucide-react";
import { CheckCircle2 } from "lucide-react";

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
}: StudentManagementProps) {
  // Simple, corrected render structure
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
      
      <div className="flex items-center space-x-4">
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
             
        <div className="text-sm text-muted-foreground">
  Framvinda kemur fljótlega...
</div>

      </div>
    </div>
  </div>
))}
 
      <div className="bg-card border rounded-lg p-4 mb-6">
        <h3 className="font-bold mb-4">Bæta við nýjum nemanda</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Nafn nemanda"
            value={newStudentName}
            onChange={(e) => setNewStudentName(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />

          <input
            type="email"
            placeholder="Netfang"
            value={newStudentEmail}
            onChange={(e) => setNewStudentEmail(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />

          <div className="flex gap-2">
            <button
              className="px-4 py-2 rounded border"
              onClick={async () => {
                const newStudent = {
                  email: newStudentEmail,
                  name: newStudentName,
                  role: "student",
                  completed: [],
                };

             const updatedStudentsList = [
  ...studentList,
  newStudent,
];

setStudentList(updatedStudentsList);

await saveStudentToSupabase(newStudent);

setNewStudentName("");
setNewStudentEmail("");   
              
              }}
            >
              ➕ Bæta við nemanda
            </button>

            <button
              className="px-4 py-2 rounded border"
              onClick={() => {
                setNewStudentName("");
                setNewStudentEmail("");
              }}
            >
              Hætta við
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}