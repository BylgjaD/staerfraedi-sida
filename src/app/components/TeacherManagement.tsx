interface TeacherManagementProps {
  teacherList: any[];
  newTeacherName: string;
  setNewTeacherName: React.Dispatch<React.SetStateAction<string>>;
  newTeacherPassword: string;
  setNewTeacherPassword: React.Dispatch<React.SetStateAction<string>>;
  newTeacherEmail: string;
  setNewTeacherEmail: React.Dispatch<React.SetStateAction<string>>;
  saveTeachers: (teacher: any[]) => void;
  saveTeacherToSupabase: (teacher: any) => Promise<any>;
  setTeacherList: React.Dispatch<React.SetStateAction<any[]>>;
  setEditingTeacher: React.Dispatch<React.SetStateAction<any | null>>;
  setEditName: React.Dispatch<React.SetStateAction<string>>;
  setEditEmail: React.Dispatch<React.SetStateAction<string>>;
  setEditPassword: React.Dispatch<React.SetStateAction<string>>;
  editName: string;
  editEmail: string;
  editPassword: string;
  editingTeacher: any | null;
  updateTeacherInSupabase: (oldEmail: string, teacher: any) => Promise<void>;
}
export default function TeacherManagement({
  teacherList,
  newTeacherName,
  setNewTeacherName,
  newTeacherEmail,
  setNewTeacherEmail,
  newTeacherPassword,
  setNewTeacherPassword,
  saveTeachers,
  saveTeacherToSupabase,
  setTeacherList,
  setEditingTeacher,
  setEditName,
  setEditEmail,
  setEditPassword,
  editName,
  editEmail,
  editPassword,
  editingTeacher,
  updateTeacherInSupabase,
}: TeacherManagementProps) {
  return (
  <div className="bg-card rounded-lg border p-4 mt-4">

    <h3 className="font-bold mb-4">
      Kennarar ({teacherList.length})
    </h3>

    <div className="mb-4 space-y-2">

      <input
  type="text"
  placeholder="Nafn kennara"
  value={newTeacherName}
  onChange={(e) => setNewTeacherName(e.target.value)}
  className="border rounded px-3 py-2 w-full"
/>
 <input
    type="email"
    placeholder="Netfang"
    value={newTeacherEmail}
    onChange={(e) => setNewTeacherEmail(e.target.value)}
    className="border rounded px-3 py-2 w-full"
  />
  <input
    type="text"
    placeholder="Lykilorð"
    value={newTeacherPassword}
    onChange={(e) => setNewTeacherPassword(e.target.value)}
    className="border rounded px-3 py-2 w-full"
  />
  <button

    className="px-4 py-2 rounded border"

    onClick={async () => {

  const newTeacher = {

    email: newTeacherEmail,

    password: newTeacherPassword,

    name: newTeacherName,

    role: "teacher" as const,

  };



  const updatedTeachers = [

    ...teacherList,

    newTeacher,

  ];



  saveTeachers(updatedTeachers);



  await saveTeacherToSupabase(newTeacher);



  setNewTeacherName("");

  setNewTeacherEmail("");

  setNewTeacherPassword("");

  setTeacherList(updatedTeachers);

}}

  >

    ➕ Bæta við kennara

  </button>
    </div>
 {teacherList.map((teacher: any) => (
                  <div
                    key={teacher.email}
                    className="flex justify-between items-center py-3 border-b"
                  >
                    <div>
                     <div className="font-semibold">{teacher.name}</div>
                     <div className="text-sm text-muted-foreground">
                       {teacher.email}
                      </div>
                     </div>
                    

<div className="flex gap-2">

  <button
  onClick={() => {
    setEditingTeacher(teacher);
    setEditName(teacher.name);
    setEditEmail(teacher.email);
    setEditPassword(teacher.password);
  }}
  className="px-3 py-1 rounded border"
>
      Eyða
</button>
  </div>
</div>
))} 
      <input
        value={editName}
        onChange={(e) => setEditName(e.target.value)}
        placeholder="Nafn"
        className="border rounded px-3 py-2 w-full"
      />

      <input
        value={editEmail}
        onChange={(e) => setEditEmail(e.target.value)}
        placeholder="Netfang"
        className="border rounded px-3 py-2 w-full"
      />

      <input
        value={editPassword}
        onChange={(e) => setEditPassword(e.target.value)}
        placeholder="Lykilorð"
        className="border rounded px-3 py-2 w-full"
      />

      <div className="flex gap-2">

        <button
          onClick={async () => {
  const updatedTeacher = {
    name: editName,
    email: editEmail,
    password: editPassword,
    role: editingTeacher.role,
  };

  const updatedTeachers = teacherList.map(
    (teacher) =>
      teacher.email === editingTeacher.email
        ? {
            ...teacher,
            ...updatedTeacher,
          }
        : teacher
  );

  saveTeachers(updatedTeachers);

   await updateTeacherInSupabase(
      editingTeacher.email, updatedTeacher
      );

  setTeacherList(updatedTeachers);
  setEditingTeacher(null);
}}  
  className="px-4 py-2 rounded border"
        >
          Vista
        </button>

        <button
          onClick={() => setEditingTeacher(null)}
          className="px-4 py-2 rounded border"
        >
          Hætta við
        </button>

      </div>
    </div>
)}
