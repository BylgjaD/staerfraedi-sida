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
  loadExercisesForSection,
  saveExerciseToSupabase,
  deleteExerciseFromSupabase,
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
interface SubpartData {
  label: string;
  question_text: string;
  answer_type: "multiple_choice" | "numeric" | "text";
  choices: string[] | null;
  correct_answer: string;
  hint1: string | null;
  hint2: string | null;
  hint3: string | null;
}

interface ExerciseData {
  id: string;
  teacher_email: string;
  category_id: string;
  section_id: string;
  level: string;
  question_number: number;
  question_text: string;
  answer_type: "multiple_choice" | "numeric" | "text";
  choices: string[] | null;
  correct_answer: string;
  hint1: string | null;
  hint2: string | null;
  hint3: string | null;
  image_url: string | null;
  created_at: string;
  subparts: SubpartData[] | null;
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
 const [exercises, setExercises] = useState<ExerciseData[]>([]);
 const [exerciseCategoryId, setExerciseCategoryId] = useState(CATEGORIES[0].id);
 const [exerciseSectionId, setExerciseSectionId] = useState(CATEGORIES[0].sections[0].id);
 const [exerciseLevel, setExerciseLevel] = useState<string>(LEVELS[0]);

 const [questionText, setQuestionText] = useState("");
 const [answerType, setAnswerType] = useState<"multiple_choice" | "numeric" | "text">("numeric");
 const [choice1, setChoice1] = useState("");
 const [choice2, setChoice2] = useState("");
 const [choice3, setChoice3] = useState("");
 const [choice4, setChoice4] = useState("");
 const [correctChoiceIndex, setCorrectChoiceIndex] = useState(0);
 const [numericAnswer, setNumericAnswer] = useState("");
 const [hint1, setHint1] = useState("");
 const [hint2, setHint2] = useState("");
 const [hint3, setHint3] = useState("");
 const [savingExercise, setSavingExercise] = useState(false);

 const lessonCategory = CATEGORIES.find((c) => c.id === lessonCategoryId)!;
 const exerciseCategory = CATEGORIES.find((c) => c.id === exerciseCategoryId)!;
 const [exerciseImageFile, setExerciseImageFile] = useState<File | null>(null);
 const [exerciseImagePreview, setExerciseImagePreview] = useState<string | null>(null);
const [subparts, setSubparts] = useState<SubpartData[]>([]);

const addSubpart = () => {
  const nextLabel = String.fromCharCode(97 + subparts.length); // a, b, c...
  setSubparts([
    ...subparts,
    {
      label: nextLabel,
      question_text: "",
      answer_type: "numeric",
      choices: null,
      correct_answer: "",
      hint1: null,
      hint2: null,
      hint3: null,
    },
  ]);
};

const updateSubpart = (index: number, changes: Partial<SubpartData>) => {
  setSubparts(subparts.map((sp, i) => (i === index ? { ...sp, ...changes } : sp)));
};

const removeSubpart = (index: number) => {
  setSubparts(
    subparts
      .filter((_, i) => i !== index)
      .map((sp, i) => ({ ...sp, label: String.fromCharCode(97 + i) })) // endurnúmera a,b,c...
  );
};

const handleExerciseImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  setExerciseImageFile(file);
  setExerciseImagePreview(URL.createObjectURL(file));
};

const handleLessonCategoryChange = (catId: string) => {
  setLessonCategoryId(catId);
  const cat = CATEGORIES.find((c) => c.id === catId)!;
  setLessonSectionId(cat.sections[0].id);
};
const handleExerciseCategoryChange = (catId: string) => {
  setExerciseCategoryId(catId);
  const cat = CATEGORIES.find((c) => c.id === catId)!;
  setExerciseSectionId(cat.sections[0].id);
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

  useEffect(() => {
  if (activeTab === "exercises") {
    loadExercisesForSection(exerciseCategoryId, exerciseSectionId).then(setExercises);
  }
}, [activeTab, exerciseCategoryId, exerciseSectionId]);

const handleAddExercise = async () => {
  if (!questionText.trim()) return;

  setSavingExercise(true);

  let imageUrl: string | null = null;
  if (exerciseImageFile) {
    imageUrl = await uploadNoteImage(exerciseImageFile);
  }

  const nextNumber = exercises.filter((e) => e.level === exerciseLevel).length + 1;

  const hasSubparts = subparts.length > 0;

  const choices = !hasSubparts && answerType === "multiple_choice" ? [choice1, choice2, choice3, choice4] : null;
  const correctAnswer = !hasSubparts
    ? answerType === "multiple_choice"
      ? [choice1, choice2, choice3, choice4][correctChoiceIndex]
      : numericAnswer.trim()
    : "";

  if (!hasSubparts && !correctAnswer) {
    setSavingExercise(false);
    return;
  }

  const newExercise = {
    teacher_email: currentUser.email,
    category_id: exerciseCategoryId,
    section_id: exerciseSectionId,
    level: exerciseLevel,
    question_number: nextNumber,
    question_text: questionText.trim(),
    answer_type: answerType,
    choices,
    correct_answer: correctAnswer,
    image_url: imageUrl,
    hint1: hint1.trim() || null,
    hint2: hint2.trim() || null,
    hint3: hint3.trim() || null,
    subparts: hasSubparts ? subparts : null,
  };

  const data = await saveExerciseToSupabase(newExercise);
  if (data && data[0]) {
    setExercises([...exercises, data[0]]);
  }

  setQuestionText("");
  setChoice1(""); setChoice2(""); setChoice3(""); setChoice4("");
  setCorrectChoiceIndex(0);
  setNumericAnswer("");
  setHint1(""); setHint2(""); setHint3("");
  setExerciseImageFile(null);
  setExerciseImagePreview(null);
  setSubparts([]); // ← nýtt, hreinsa undirliði
  setSavingExercise(false);
};

const handleDeleteExercise = async (id: string) => {
  await deleteExerciseFromSupabase(id);
  setExercises(exercises.filter((e) => e.id !== id));
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
          { key: "exercises", label: "Dæmi" },
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

      {activeTab === "exercises" && (
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
          <h3 className="text-lg font-bold mb-2">Dæmi</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={exerciseCategoryId}
              onChange={(e) => handleExerciseCategoryChange(e.target.value)}
              className="border rounded-lg p-2 text-sm"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <select
              value={exerciseSectionId}
              onChange={(e) => setExerciseSectionId(e.target.value)}
              className="border rounded-lg p-2 text-sm"
            >
              {exerciseCategory.sections.map((sec) => (
                <option key={sec.id} value={sec.id}>{sec.name}</option>
              ))}
            </select>

            <select
              value={exerciseLevel}
              onChange={(e) => setExerciseLevel(e.target.value)}
              className="border rounded-lg p-2 text-sm"
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>{LEVEL_META[l].label}</option>
              ))}
            </select>
          </div>

          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Spurningatexti"
            className="w-full border rounded-lg p-2"
            rows={2}
          />
          <input type="file" accept="image/*" onChange={handleExerciseImageChange} />
{exerciseImagePreview && (
  <img src={exerciseImagePreview} className="max-h-32 rounded-lg border" />
)}

<div className="border-t pt-4 space-y-3">
  <div className="flex items-center justify-between">
    <span className="text-sm font-semibold">Undirliðir (valfrjálst)</span>
    <button
      onClick={addSubpart}
      className="text-sm text-blue-600 hover:underline"
    >
      + Bæta við lið
    </button>
  </div>

  {subparts.map((sp, i) => (
    <div key={i} className="border rounded-lg p-3 space-y-2 bg-muted/20">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">Liður {sp.label})</span>
        <button
          onClick={() => removeSubpart(i)}
          className="text-red-600 text-sm hover:underline"
        >
          Fjarlægja
        </button>
      </div>

      <input
        type="text"
        value={sp.question_text}
        onChange={(e) => updateSubpart(i, { question_text: e.target.value })}
        placeholder={`Spurningatexti fyrir lið ${sp.label})`}
        className="w-full border rounded-lg p-2 text-sm"
      />

      <select
        value={sp.answer_type}
        onChange={(e) =>
          updateSubpart(i, {
            answer_type: e.target.value as SubpartData["answer_type"],
            choices: e.target.value === "multiple_choice" ? ["", "", "", ""] : null,
          })
        }
        className="border rounded-lg p-2 text-sm"
      >
        <option value="numeric">Talnasvar</option>
        <option value="text">Textasvar</option>
        <option value="multiple_choice">Margval</option>
      </select>

      {sp.answer_type === "multiple_choice" ? (
        <div className="space-y-1">
          {(sp.choices || ["", "", "", ""]).map((val, ci) => (
            <div key={ci} className="flex items-center gap-2">
              <input
                type="radio"
                checked={sp.correct_answer === val && val !== ""}
                onChange={() => updateSubpart(i, { correct_answer: val })}
              />
              <input
                type="text"
                value={val}
                onChange={(e) => {
                  const newChoices = [...(sp.choices || ["", "", "", ""])];
                  newChoices[ci] = e.target.value;
                  updateSubpart(i, {
                    choices: newChoices,
                    correct_answer: sp.correct_answer === val ? e.target.value : sp.correct_answer,
                  });
                }}
                placeholder={`Svarmöguleiki ${ci + 1}`}
                className="flex-1 border rounded-lg p-1.5 text-sm"
              />
            </div>
          ))}
        </div>
      ) : (
        <input
          type="text"
          value={sp.correct_answer}
          onChange={(e) => updateSubpart(i, { correct_answer: e.target.value })}
          placeholder="Rétt svar"
          className="w-full border rounded-lg p-2 text-sm"
        />
      )}

      
      <input
  type="text"
  value={sp.hint1 || ""}
  onChange={(e) => updateSubpart(i, { hint1: e.target.value || null })}
  placeholder="Vísbending 1"
  className="w-full border rounded-lg p-2 text-sm"
/>
<input
  type="text"
  value={sp.hint2 || ""}
  onChange={(e) => updateSubpart(i, { hint2: e.target.value || null })}
  placeholder="Vísbending 2"
  className="w-full border rounded-lg p-2 text-sm"
/>
<input
  type="text"
  value={sp.hint3 || ""}
  onChange={(e) => updateSubpart(i, { hint3: e.target.value || null })}
  placeholder="Vísbending 3"
  className="w-full border rounded-lg p-2 text-sm"
/>
    </div>
  ))}

</div>
 {subparts.length === 0 && (
   <>
          <select
            value={answerType}
            onChange={(e) => setAnswerType(e.target.value as "multiple_choice" | "numeric"| "text")}
            className="border rounded-lg p-2 text-sm"
          >
            <option value="numeric">Talnasvar</option>
            <option value="text">Textasvar</option>
            <option value="multiple_choice">Fjölvals</option>
          </select>

          {answerType !== "multiple_choice" ? (
            <input
              type="text"
              value={numericAnswer}
              onChange={(e) => setNumericAnswer(e.target.value)}
              placeholder={answerType === "numeric" ? "Rétt svar (t.d. 42)" : "Rétt svar (t.d. hluti deilt með heild)"}
              className="w-full border rounded-lg p-2"
            />
          ) : (
            <div className="space-y-2">
              {[choice1, choice2, choice3, choice4].map((val, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={correctChoiceIndex === i}
                    onChange={() => setCorrectChoiceIndex(i)}
                  />
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => {
                      const setters = [setChoice1, setChoice2, setChoice3, setChoice4];
                      setters[i](e.target.value);
                    }}
                    placeholder={`Svarmöguleiki ${i + 1}`}
                    className="flex-1 border rounded-lg p-2 text-sm"
                  />
                </div>
              ))}
              <p className="text-xs text-muted-foreground">Merktu réttan valmöguleika með punkti til vinstri</p>
            </div>
             )}
             </>
          )}

          {subparts.length === 0 && (
          <div className="space-y-2">
            <input
              type="text"
              value={hint1}
              onChange={(e) => setHint1(e.target.value)}
              placeholder="Vísbending 1"
              className="w-full border rounded-lg p-2 text-sm"
            />
            <input
              type="text"
              value={hint2}
              onChange={(e) => setHint2(e.target.value)}
              placeholder="Vísbending 2"
              className="w-full border rounded-lg p-2 text-sm"
            />
            <input
              type="text"
              value={hint3}
              onChange={(e) => setHint3(e.target.value)}
              placeholder="Vísbending 3"
              className="w-full border rounded-lg p-2 text-sm"
            />
          </div>
          )}

          <button
            onClick={handleAddExercise}
            disabled={savingExercise}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            {savingExercise ? "Vistar..." : "Vista dæmi"}
          </button>

          <div className="space-y-3 mt-6">
            {exercises.length === 0 && (
              <p className="text-muted-foreground text-sm">Engin dæmi ennþá fyrir þennan hluta.</p>
            )}
            {exercises.map((ex) => (
              <div key={ex.id} className="border rounded-lg p-3 flex justify-between items-start gap-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    {LEVEL_META[ex.level as keyof typeof LEVEL_META]?.label} · Dæmi #{ex.question_number}
                  </div>
                  <div className="text-sm">{ex.question_text}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Svar: {ex.correct_answer}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteExercise(ex.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors shrink-0"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
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

