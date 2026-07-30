import { ArrowLeft, Lock, CheckCircle2 } from "lucide-react";
import { Level } from "../../lib/types";
import PageHeader from "./PageHeader";
import { UserData } from "../../lib/types";
import { useState, useEffect } from "react";
import {
  loadTeacherNotesForSection,
  loadStudentNotes,
  saveNoteToSupabase,
  uploadNoteImage,
  loadExercisesForSection,
  loadLessonsForSection,
} from "../../lib/supabase";

import {
  LEVEL_META,
  CategoryData,
  SectionData,
} from "../../data/categories";

import { BookOpen } from "lucide-react";

// ... interface fyrir glósur, sama og í TeacherDashboard
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
interface ExerciseData {
  id: string;
  category_id: string;
  section_id: string;
  level: string;
  question_number: number;
  question_text: string;
  answer_type: "multiple_choice" | "numeric";
  choices: string[] | null;
  correct_answer: string;
  hint1: string | null;
  hint2: string | null;
  hint3: string | null;
}
function getYouTubeEmbedUrl(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function LevelView({
  category, section, level, isCompleted, onComplete, onBack, currentUser,
}: {
  category: CategoryData;
  section: SectionData;
  level: Level;
  isCompleted: boolean;
  onComplete: () => void;
  onBack: () => void;
  currentUser: UserData;
}) {

  const [justCompleted, setJustCompleted] = useState(false);
  const meta = LEVEL_META[level];

  const [teacherNotes, setTeacherNotes] = useState<NoteData[]>([]);
  const [myNotes, setMyNotes] = useState<NoteData[]>([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [lessons, setLessons] = useState<any[]>([]);
  const [exercises, setExercises] = useState<ExerciseData[]>([]);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, "correct" | "incorrect" | null>>({});
  const [hintsShown, setHintsShown] = useState<Record<string, number>>({});

useEffect(() => {
  loadExercisesForSection(category.id, section.id).then((all) =>
    setExercises(all.filter((e: ExerciseData) => e.level === level))
  );
}, [category.id, section.id, level]);

const handleCheckAnswer = (exercise: ExerciseData) => {
  const studentAnswer = (studentAnswers[exercise.id] || "").trim().toLowerCase();
  const correctAnswer = exercise.correct_answer.trim().toLowerCase();
  const isCorrect = studentAnswer === correctAnswer;

  setFeedback({ ...feedback, [exercise.id]: isCorrect ? "correct" : "incorrect" });
};

const handleShowHint = (exerciseId: string) => {
  const current = hintsShown[exerciseId] || 0;
  if (current < 3) {
    setHintsShown({ ...hintsShown, [exerciseId]: current + 1 });
  }
};

  useEffect(() => {
  loadLessonsForSection(category.id, section.id).then((all) =>
    setLessons(all.filter((l: any) => !l.level || l.level === level))
  );
}, [category.id, section.id, level]);

 
  useEffect(() => {
    loadTeacherNotesForSection(category.id, section.id).then((all) =>
      setTeacherNotes(all.filter((n: NoteData) => !n.level || n.level === level))
    );
    loadStudentNotes(currentUser.email, category.id, section.id).then((all) =>
      setMyNotes(all.filter((n: NoteData) => n.level === level))
    );
  }, [category.id, section.id, level]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewImageFile(file);
    setNewImagePreview(URL.createObjectURL(file));
  };

  const handleAddMyNote = async () => {
    if (!newNoteText.trim() && !newImageFile) return;
    setSaving(true);

    let imageUrl: string | null = null;
    if (newImageFile) {
      imageUrl = await uploadNoteImage(newImageFile);
    }
    const newNote = {
      teacher_email: null,
      student_email: currentUser.email,
      category_id: category.id,
      section_id: section.id,
      level: level,
      text: newNoteText.trim() || null,
      image_url: imageUrl,
    };

    const data = await saveNoteToSupabase(newNote);
    if (data && data[0]) {
      setMyNotes([data[0], ...myNotes]);
    }

    setNewNoteText("");
    setNewImageFile(null);
    setNewImagePreview(null);
    setSaving(false);
  };

   const handleComplete = () => {
    onComplete();
    setJustCompleted(true);
    setTimeout(onBack, 1200);
  };
  const allExercisesCorrect =      
    exercises.length > 0 && exercises.every((ex) => feedback[ex.id] === "correct");
  const canComplete = exercises.length === 0 || allExercisesCorrect;

   return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Outfit', sans-serif" }}>
       <header className="sticky top-0 z-20 bg-card border-b border-border">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={onBack}
            className="flex items-center gap-2 text-sm font-semibold hover:text-foreground text-muted-foreground transition-colors">
            <ArrowLeft size={16} /> Til baka
          </button>
        </div>
      </header>

            <main className="max-w-5xl mx-auto px-4 py-12">
  <div className="text-center mb-10">
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
      style={{ background: `${meta.hex}15`, color: meta.hex }}>
      <span className="text-base font-bold">{level}</span> {meta.label}
    </div>
    <PageHeader
      title={`${section.abbr}-${level} · ${section.name}`}
      description={category.name}
    />
  </div>

  <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">

    {/* Vinstri dálkur: Glósur - birtist á eftir dæmum á síma, en vinstra megin á tölvu */}
    <div className="order-2 lg:order-1 space-y-6">

  {lessons.length > 0 && (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <span className="font-semibold text-sm">🎥 Kennslustund</span>
      </div>
      <div className="px-4 py-3 space-y-4">
        {lessons.map((lesson) => {
          const embedUrl = getYouTubeEmbedUrl(lesson.video_url);
          return (
            <div key={lesson.id}>
              <div className="font-semibold text-sm mb-1">{lesson.title}</div>
              {lesson.description && (
                <p className="text-sm text-muted-foreground mb-2">{lesson.description}</p>
              )}
              {embedUrl && (
                <div className="aspect-video">
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

  {teacherNotes.length > 0 && (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <span className="font-semibold text-sm">📘 Glósur frá kennara</span>
      </div>
      <div className="px-4 py-3 space-y-3">
        {teacherNotes.map((note) => (
          <div key={note.id} className="border rounded-lg p-3">
            {note.text && <p className="text-sm">{note.text}</p>}
            {note.image_url && (
              <img src={note.image_url} className="mt-2 max-h-32 rounded-lg w-full object-cover" />
            )}
          </div>
        ))}
      </div>
    </div>
  )}

  <div className="bg-card border border-border rounded-xl overflow-hidden">
    <div className="px-4 py-3 border-b border-border">
      <span className="font-semibold text-sm">✏️ Mínar glósur</span>
    </div>
    <div className="px-4 py-3 space-y-3">
      <textarea
        value={newNoteText}
        onChange={(e) => setNewNoteText(e.target.value)}
        placeholder="Skrifaðu þína eigin glósu hér..."
        className="w-full border rounded-lg p-2 text-sm"
        rows={3}
      />
      <input type="file" accept="image/*" onChange={handleImageChange} />
      {newImagePreview && (
        <img src={newImagePreview} className="max-h-28 rounded-lg border w-full object-cover" />
      )}
      <button
        onClick={handleAddMyNote}
        disabled={saving}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50"
      >
        {saving ? "Vistar..." : "Vista glósu"}
      </button>

      {myNotes.length > 0 && (
        <div className="space-y-2 mt-3">
          {myNotes.map((note) => (
            <div key={note.id} className="border rounded-lg p-3">
              {note.text && <p className="text-sm">{note.text}</p>}
              {note.image_url && (
                <img src={note.image_url} className="mt-2 max-h-32 rounded-lg w-full object-cover" />
              )}
            </div>   
          ))}
        </div>
      )}
    </div>
  </div>
</div>

    <div className="order-1 lg:order-2 space-y-6">
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-3">
          <BookOpen size={18} style={{ color: category.accentColor }} />
          <span className="font-semibold text-sm">Verkefni</span>
        </div>
        
        <div className="px-5 py-6 space-y-6">
  {exercises.length === 0 && (
    <p className="text-sm text-muted-foreground text-center">
      Engin dæmi ennþá fyrir þetta stig.
    </p>
  )}

  {exercises.map((exercise) => {
    const shownHints = hintsShown[exercise.id] || 0;
    const hints = [exercise.hint1, exercise.hint2, exercise.hint3].filter(Boolean);
    const fb = feedback[exercise.id];

    return (
      <div key={exercise.id} className="border rounded-xl p-4">
        <div className="text-xs text-muted-foreground mb-1">
          Dæmi #{exercise.question_number}
        </div>
        <p className="font-medium mb-3">{exercise.question_text}</p>

      {exercise.answer_type === "numeric" ? (
  <input
    type="text"
    value={studentAnswers[exercise.id] || ""}
    onChange={(e) =>
      setStudentAnswers({ ...studentAnswers, [exercise.id]: e.target.value })
    }
    placeholder="Svarið þitt"
    className="w-full border rounded-lg p-2 text-sm mb-2"
  />
) : (
  <div className="space-y-2 mb-2">
    {exercise.choices?.map((choice, i) => (
      <label key={i} className="flex items-center gap-2 text-sm">
        <input
          type="radio"
          name={`exercise-${exercise.id}`}
          checked={studentAnswers[exercise.id] === choice}
          onChange={() =>
            setStudentAnswers({ ...studentAnswers, [exercise.id]: choice })
          }
        />
        {choice}
      </label>
    ))}
  </div>
)}

<div className="flex items-center gap-2 flex-wrap">
  <button
    onClick={() => handleCheckAnswer(exercise)}
    className="px-3 py-1.5 rounded-lg text-sm text-white"
    style={{ background: meta.hex }}
  >
    Athuga svar
  </button>

  {shownHints < 3 && (
    <button
      onClick={() => handleShowHint(exercise.id)}
      className="px-3 py-1.5 rounded-lg border text-sm"
    >
      💡 Fá vísbendingu
    </button>
  )}
</div> 

    {fb === "incorrect" && (
      <p className="text-red-600 text-sm font-medium mt-2">Ekki alveg — prófaðu aftur.</p>
    )}
        </div>
      );
    })}
  </div>

      {isCompleted || justCompleted ? (
  <div className="flex items-center justify-center gap-2 py-4 text-emerald-600 font-semibold">
    <CheckCircle2 size={20} />
    {justCompleted ? "Frábærlega gert! Hleður..." : "Þetta stig er þegar lokið"}
  </div>
) : (
  <div>
    <button
      onClick={handleComplete}
      disabled={!canComplete}
      className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-98 text-white shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
      style={{ background: `linear-gradient(135deg, ${meta.hex}, ${meta.hex}cc)` }}
    >
      Ljúka stigi {level} · {meta.label}
    </button>
    {exercises.length > 0 && !allExercisesCorrect && (
      <p className="text-xs text-muted-foreground text-center mt-2">
        Leystu öll dæmin rétt til að geta lokið þessu stigi.
      </p>
    )}
  </div>
)}

      </div>
    </div>
  </div>
  </main>
</div>
  );
}
export default LevelView;