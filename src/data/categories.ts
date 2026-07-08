export type Level = "δ" | "β" | "α";

export const LEVELS: Level[] = ["δ", "β", "α"];

export const LEVEL_META: Record<
  Level,
  {
    label: string;
    colorClass: string;
    bgClass: string;
    borderClass: string;
    hex: string;
  }
> = {
  δ: {
    label: "Delta",
    colorClass: "text-emerald-700",
    bgClass: "bg-emerald-500",
    borderClass: "border-emerald-400",
    hex: "#059669",
  },
  β: {
    label: "Beta",
    colorClass: "text-blue-700",
    bgClass: "bg-blue-500",
    borderClass: "border-blue-400",
    hex: "#2563eb",
  },
  α: {
    label: "Alpha",
    colorClass: "text-amber-700",
    bgClass: "bg-amber-500",
    borderClass: "border-amber-400",
    hex: "#d97706",
  },
};