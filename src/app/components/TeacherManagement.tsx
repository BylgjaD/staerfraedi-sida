import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { setUserActive } from "../../lib/supabase";

interface TeacherManagementProps {
  teacherList: any[];
  newTeacherName: string;
  setNewTeacherName: React.Dispatch<React.SetStateAction<string>>;
  newTeacherPassword: string;
  setNewTeacherPassword: React.Dispatch<React.SetStateAction<string>>;
  newTeacherEmail: string;
  setNewTeacherEmail: React.Dispatch<React.SetStateAction<string>>;
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
  setUserActive: (teacherId: string, active: boolean) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;
}

export default function TeacherManagement({
  teacherList,
  newTeacherName,
  setNewTeacherName,
  newTeacherEmail,
  setNewTeacherEmail,
  newTeacherPassword,
  setNewTeacherPassword,
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
  deleteTeacher,
}: TeacherManagementProps) {
  const [saving, setSaving] = useState(false);

  return (
    <div className="space-y-6">
      {/* Bæta við kennara */}
      <div className="bg-card rounded-xl border p-5">
        <h3 className="font-bold mb-4">Bæta við kennara</h3>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Nafn kennara"
            value={newTeacherName}
            onChange={(e) => setNewTeacherName(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full"
          />
          <input
            type="email"
            placeholder="Netfang"
            value={newTeacherEmail}
            onChange={(e) => setNewTeacherEmail(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full"
          />
          <input
            type="text"
            placeholder="Lykilorð"
            value={newTeacherPassword}
            onChange={(e) => setNewTeacherPassword(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full"
          />
          <button
            disabled={saving}
            className="px-4 py-2 rounded-lg border disabled:opacity-50"
            onClick={async () => {
              setSaving(true);

              const { data, error } = await supabase.functions.invoke("create-user", {
                body: {
                  email: newTeacherEmail,
                  password: newTeacherPassword,
                  name: newTeacherName,
                  role: "teacher",
                },
              });

              if (error || data?.error) {
                alert(data?.error || error?.message || "Villa við að búa til kennara");
              } else {
                const newTeacher = {
                  id: data.id,
                  email: newTeacherEmail,
                  name: newTeacherName,
                  role: "teacher" as const,
                };

                setTeacherList([...teacherList, newTeacher]);
                setNewTeacherName("");
                setNewTeacherEmail("");
                setNewTeacherPassword("");
              }

              setSaving(false);
            }}
          >
            {saving ? "Vistar..." : "➕ Bæta við kennara"}
          </button>
        </div>
      </div>

      {/* Kennaralisti */}
      <div>
        <h3 className="font-bold mb-4">Kennarar ({teacherList.length})</h3>

        <div className="space-y-4">
          {teacherList.map((teacher: any) => (
            <div key={teacher.email} className="bg-card border rounded-xl p-4">
              <div className="flex items-start justify-between mb-1">
                <div className="font-semibold text-base">{teacher.name}</div>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    teacher.active === false
                      ? "bg-gray-100 text-gray-500"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {teacher.active === false ? "Óvirkur" : "Virkur"}
                </span>
              </div>

              <div className="text-sm text-muted-foreground mb-3">{teacher.email}</div>

              <div className="flex flex-wrap items-center gap-2 pt-3 border-t">
                <button
                  onClick={() => {
                    setEditingTeacher(teacher);
                    setEditName(teacher.name);
                    setEditEmail(teacher.email);
                    setEditPassword("");
                  }}
                  className="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50"
                >
                  Breyta
                </button>

                <button
                  onClick={async () => {
                    const newActiveState = teacher.active === false ? true : false;
                    await setUserActive(teacher.id, newActiveState);
                    setTeacherList(
                      teacherList.map((t) =>
                        t.id === teacher.id ? { ...t, active: newActiveState } : t
                      )
                    );
                  }}
                  className="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50"
                >
                  {teacher.active === false ? "Gera virkan" : "Gera óvirkan"}
                </button>

                <button
                  onClick={() => deleteTeacher(teacher.id)}
                  className="ml-auto px-3 py-1.5 rounded-lg border text-sm text-red-600 hover:bg-red-50"
                >
                  Eyða
                </button>
              </div>

              {editingTeacher?.email === teacher.email && (
                <div className="mt-3 pt-3 border-t space-y-2">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Nafn"
                    className="border rounded-lg px-3 py-2 w-full text-sm"
                  />
                  <input
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="Netfang"
                    className="border rounded-lg px-3 py-2 w-full text-sm"
                  />
                  <input
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Nýtt lykilorð (valfrjálst)"
                    className="border rounded-lg px-3 py-2 w-full text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        const updatedTeacher = {
                          name: editName,
                          email: editEmail,
                          role: editingTeacher.role,
                        };

                        const updatedTeachers = teacherList.map((t) =>
                          t.email === editingTeacher.email ? { ...t, ...updatedTeacher } : t
                        );

                        setTeacherList(updatedTeachers);
                        await updateTeacherInSupabase(editingTeacher.email, updatedTeacher);
                        setEditingTeacher(null);
                      }}
                      className="px-4 py-1.5 rounded-lg border text-sm bg-blue-600 text-white"
                    >
                      Vista
                    </button>
                    <button
                      onClick={() => setEditingTeacher(null)}
                      className="px-4 py-1.5 rounded-lg border text-sm"
                    >
                      Hætta við
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
