import { X } from "lucide-react";
import { UserData } from "../../lib/types";
import { CATEGORIES, LEVEL_META, LEVELS } from "../../data/categories";
import { categoryProgress } from "../../lib/progress";

interface ProgressModalProps {
  student: UserData;
  onClose: () => void;
}

export default function ProgressModal({ student, onClose }: ProgressModalProps) {
  const completed = student.completed || [];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-bold" style={{ color: "#1e3a5f" }}>
              {student.name}
            </h2>
            <p className="text-sm text-muted-foreground">{student.email}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {completed.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Engin framvinda skráð ennþá fyrir þennan nemanda.
            </p>
          )}

          {CATEGORIES.map((cat) => {
            const { done, total } = categoryProgress(completed, cat.id);
            if (done === 0) return null; // sleppa köflum sem ekkert er byrjað í

            return (
              <div key={cat.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">
                    {cat.icon} {cat.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {done}/{total} stig
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full"
                    style={{
                      width: `${Math.round((done / total) * 100)}%`,
                      background: cat.accentColor,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}