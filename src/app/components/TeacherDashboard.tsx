import { useState, useEffect } from "react";
import StatCard from "./StatCard"; 
import PageHeader from "./PageHeader";
import { Users, Activity, AlertTriangle, Flag, Trash2 } from "lucide-react";
import { Video } from "lucide-react";
import { UserData } from "../../lib/types";
import { CATEGORIES, LEVELS, LEVEL_META } from "../../data/categories";
import {
  loadNotesFromSupabase,
  saveNoteToSupabase,
  deleteNoteFromSupabase,
  uploadNoteImage,
  loadLessonsForTeacher,   
  saveLessonToSupabase,    
  deleteLessonFromSupabase,
} from "../../lib/supabase";

interface TeacherDashboardProps {
    currentUser: UserData;
     studentsContent?: React.ReactNode;
}
  interface NoteData {
  id: string;
  teacher_email: string;
  student_email: string | null;
  category_id: string | null;
  section_id: string | null;
  level: string | null;
  text: string | null;
  image_url: string | null;
  created_at: string;
}

export default function TeacherDashboard( {currentUser, studentsContent}: TeacherDashboardProps) {
  
  const [activeTab, setActiveTab] = useState("overview");
  const [notes, setNotes] = useState<NoteData[]>([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(CATEGORIES[0].id);
  const [selectedSectionId, setSelectedSectionId] = useState(CATEGORIES[0].sections[0].id);
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [lessons, setLessons] = useState<LessonData[]>([]);
const [newLessonTitle, setNewLessonTitle] = useState("");
const [newLessonUrl, setNewLessonUrl] = useState("");
const [newLessonDescription, setNewLessonDescription] = useState("");
const [savingLesson, setSavingLesson] = useState(false);

const [lessonCategoryId, setLessonCategoryId] = useState(CATEGORIES[0].id);
const [lessonSectionId, setLessonSectionId] = useState(CATEGORIES[0].sections[0].id);
const [lessonLevel, setLessonLevel] = useState("");

const lessonCategory = CATEGORIES.find((c) => c.id === lessonCategoryId)!;

const handleLessonCategoryChange = (catId: string) => {
  setLessonCategoryId(catId);
  const cat = CATEGORIES.find((c) => c.id === catId)!;
  setLessonSectionId(cat.sections[0].id);
};

useEffect(() => {
  if (activeTab === "lessons") {
    loadLessonsForTeacher(currentUser.email).then(setLessons);
  }
}, [activeTab, currentUser.email]);

const handleAddLesson = async () => {
  if (!newLessonTitle.trim() || !newLessonUrl.trim()) return;

  const embedUrl = getYouTubeEmbedUrl(newLessonUrl.trim());
  if (!embedUrl) {
    alert("Þetta lítur ekki út eins og gildur YouTube-hlekkur");
    return;
  }

  setSavingLesson(true);

  const newLesson = {
    teacher_email: currentUser.email,
    category_id: lessonCategoryId,
    section_id: lessonSectionId,
    level: lessonLevel || null,
    title: newLessonTitle.trim(),
    video_url: newLessonUrl.trim(),
    description: newLessonDescription.trim() || null,
  };

  const data = await saveLessonToSupabase(newLesson);
  if (data && data[0]) {
    setLessons([data[0], ...lessons]);
  }

  setNewLessonTitle("");
  setNewLessonUrl("");
  setNewLessonDescription("");
  setSavingLesson(false);
};

const handleDeleteLesson = async (id: string) => {
  await deleteLessonFromSupabase(id);
  setLessons(lessons.filter((l) => l.id !== id));
};

  const selectedCategory = CATEGORIES.find((c) => c.id === selectedCategoryId)!;
 const handleCategoryChange = (catId: string) => {
    setSelectedCategoryId(catId);
    const cat = CATEGORIES.find((c) => c.id === catId)!;
    setSelectedSectionId(cat.sections[0].id);
  };

 const hour = new Date().getHours();
  let greeting = "Góðan daginn";
   let description = "Fáðu yfirlit yfir nemendur, virkni og verkefni dagsins.";
  
  if (hour >= 18) {
    greeting = "Góða kvöldið";
    description = "Svona gekk dagurinn hjá nemendum."; 
  } else if (hour < 6) {
    greeting = "Góða nótt";
    description = "Sjáumst fersk á morgun!";
  }
   useEffect(() => {
    if (activeTab === "notes") {
      loadNotesFromSupabase(currentUser.email).then(setNotes);
    }
  }, [activeTab, currentUser.email]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewImageFile(file);
    setNewImagePreview(URL.createObjectURL(file));
  };
  const handleAddNote = async () => {
    if (!newNoteText.trim() && !newImageFile) return;
    setSaving(true);

    let imageUrl: string | null = null;
    if (newImageFile) {
      imageUrl = await uploadNoteImage(newImageFile);
    }

    const newNote = {
      teacher_email: currentUser.email,
      student_email: null,
      category_id: selectedCategoryId,
      section_id: selectedSectionId,
      level: selectedLevel || null,
      text: newNoteText.trim() || null,
      image_url: imageUrl,
    };
     const data = await saveNoteToSupabase(newNote);
    if (data && data[0]) {
      setNotes([data[0], ...notes]);
    }

    setNewNoteText("");
    setNewImageFile(null);
    setNewImagePreview(null);
    setSaving(false);
  };

  const handleDeleteNote = async (id: string) => {
    await deleteNoteFromSupabase(id);
    setNotes(notes.filter((n) => n.id !== id));
  };
    return (
    <div className="p-6">
      <PageHeader title={`${greeting}, ${currentUser.name}!`} description={description} />

      <div className="flex gap-4 border-b mb-6 mt-4">
        {[
          { key: "overview", label: "Yfirlit" },
          { key: "lessons", label: "Kennslustundir" },
          { key: "notes", label: "Glósur" },
          { key: "students", label: "Nemendur" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-2 px-1 font-medium transition-all ${
              activeTab === tab.key
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<Users />} value={18} title="Nemendur" color="blue" />
          <StatCard icon={<Activity />} value={12} title="Virkir í dag" color="green" />
          <StatCard icon={<AlertTriangle />} value={3} title="Þurfa aðstoð" color="orange" />
          <StatCard icon={<Flag />} value={5} title="Lokið í dag" color="purple" />
        </div>
      )}

      {activeTab === "lessons" && (
  <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
    <h3 className="text-lg font-bold mb-2">Kennslustundir</h3>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <select
        value={lessonCategoryId}
        onChange={(e) => handleLessonCategoryChange(e.target.value)}
        className="border rounded-lg p-2 text-sm"
      >
        {CATEGORIES.map((cat) => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>

      <select
        value={lessonSectionId}
        onChange={(e) => setLessonSectionId(e.target.value)}
        className="border rounded-lg p-2 text-sm"
      >
        {lessonCategory.sections.map((sec) => (
          <option key={sec.id} value={sec.id}>{sec.name}</option>
        ))}
      </select>

      <select
        value={lessonLevel}
        onChange={(e) => setLessonLevel(e.target.value)}
        className="border rounded-lg p-2 text-sm"
      >
        <option value=""> Erfiðleikastig </option>
        {LEVELS.map((l) => (
          <option key={l} value={l}>{LEVEL_META[l].label}</option>
        ))}
      </select>
    </div>

    <input
      type="text"
      value={newLessonTitle}
      onChange={(e) => setNewLessonTitle(e.target.value)}
      placeholder="Titill kennslustundar"
      className="w-full border rounded-lg p-2"
    />

    <input
      type="text"
      value={newLessonUrl}
      onChange={(e) => setNewLessonUrl(e.target.value)}
      placeholder="YouTube hlekkur (t.d. https://youtu.be/...)"
      className="w-full border rounded-lg p-2"
    />

    <textarea
      value={newLessonDescription}
      onChange={(e) => setNewLessonDescription(e.target.value)}
      placeholder="Stutt lýsing (valfrjálst)"
      className="w-full border rounded-lg p-2"
      rows={2}
    />

    <button
      onClick={handleAddLesson}
      disabled={savingLesson}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
    >
      {savingLesson ? "Vistar..." : "Vista kennslustund"}
    </button>

    <div className="space-y-4 mt-6">
      {lessons.length === 0 && (
        <p className="text-muted-foreground text-sm">Engar kennslustundir ennþá.</p>
      )}
      {lessons.map((lesson) => {
        const cat = CATEGORIES.find((c) => c.id === lesson.category_id);
        const sec = cat?.sections.find((s) => s.id === lesson.section_id);
        const embedUrl = getYouTubeEmbedUrl(lesson.video_url);

        return (
          <div key={lesson.id} className="border rounded-lg p-3">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  {cat?.name} {sec ? `· ${sec.name}` : ""} {lesson.level ? `· ${LEVEL_META[lesson.level as keyof typeof LEVEL_META]?.label}` : ""}
                </div>
                <div className="font-semibold text-sm">{lesson.title}</div>
                {lesson.description && (
                  <p className="text-sm text-muted-foreground mt-1">{lesson.description}</p>
                )}
              </div>
              <button
                onClick={() => handleDeleteLesson(lesson.id)}
                className="text-gray-400 hover:text-red-600 transition-colors shrink-0"
              >
                <Trash2 size={18} />
              </button>
            </div>
            {embedUrl && (
              <div className="aspect-video mt-2">
                <iframe
                  src={embedUrl}
                  className="w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  </div>
)}

      {activeTab === "notes" && (
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
          <h3 className="text-lg font-bold mb-2">Glósur</h3>
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={selectedCategoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="border rounded-lg p-2 text-sm"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="border rounded-lg p-2 text-sm"
            >
              {selectedCategory.sections.map((sec) => (
                <option key={sec.id} value={sec.id}>{sec.name}</option>
              ))}
            </select>

            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="border rounded-lg p-2 text-sm"
            >
              <option value=""> Erfiðleikastig </option>
              {LEVELS.map((l) => (
                <option key={l} value={l}>{LEVEL_META[l].label}</option>
              ))}
            </select>
          </div>

          <textarea
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            placeholder="Hér má skrifa glósur"
            className="w-full border rounded-lg p-2"
            rows={3}
          />

          <input type="file" accept="image/*" onChange={handleImageChange} />

          {newImagePreview && (
            <img src={newImagePreview} alt="Forskoðun" className="max-h-40 rounded-lg border" />
          )}

          <button
            onClick={handleAddNote}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            {saving ? "Vistar..." : "Vista glósur"}
          </button>

          <div className="space-y-3 mt-6">
            {notes.length === 0 && (
              <p className="text-muted-foreground text-sm">Engar glósur ennþá.</p>
            )}
            {notes.map((note) => {
              const cat = CATEGORIES.find((c) => c.id === note.category_id);
              const sec = cat?.sections.find((s) => s.id === note.section_id);
              return (
                <div key={note.id} className="border rounded-lg p-3 flex justify-between items-start gap-3">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      {cat?.name} {sec ? `· ${sec.name}` : ""} {note.level ? `· ${LEVEL_META[note.level as keyof typeof LEVEL_META]?.label}` : ""}
                    </div>
                    {note.text && <p>{note.text}</p>}
                    {note.image_url && (
                      <img src={note.image_url} className="mt-2 max-h-40 rounded-lg" />
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors shrink-0"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "students" && (
        <div>
      {studentsContent}
    </div>
  )}
    </div>
  );
}
interface LessonData {
  id: string;
  teacher_email: string;
  category_id: string | null;
  section_id: string | null;
  level: string | null;
  title: string;
  video_url: string;
  description: string | null;
  created_at: string;
}


function getYouTubeEmbedUrl(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}
