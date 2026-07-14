export type Level = "δ" | "β" | "α";
export interface SectionData {
  id: string;
  name: string;
  abbr: string;
}
export interface CategoryData {
  id: string;
  name: string;
  icon: string;
  accentColor: string;
  sections: SectionData[];
  treeRows: string[][];
}

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
export const CATEGORIES: CategoryData[] = [
  {
    id: "talnaskilningur",
    name: "Talnaskilningur",
    icon: "∑",
    accentColor: "#16a34a",
    sections: [
      { id: "hugareikningur",  name: "Hugareikningur",  abbr: "H" },
      { id: "slumpreikningur", name: "Slumpreikningur", abbr: "S" },
      { id: "rod_adgerda",      name: "Röð aðgerða",      abbr: "RA" },
      { id: "frumtolur",       name: "Frumtölur",       abbr: "F" },
      { id: "talnamengi",      name: "Talnamengi",      abbr: "T" },
    ],
    treeRows: [["hugareikningur"], ["slumpreikningur"], ["rod_adgerda"], ["frumtolur"], ["talnamengi"]],
  },
  {
    id: "brot_og_prosentur",
    name: "Almenn brot og prósentur",
    icon: "½",
    accentColor: "#7c3aed",
    sections: [
      { id: "almenn_brot",   name: "Almenn brot",   abbr: "AB" },
      { id: "prosentur",     name: "Prósentur",     abbr: "P" },
      { id: "hlutfoll",      name: "Hlutföll",      abbr: "H" },
      { id: "breytithattur",  name: "Breytiþáttur",  abbr: "B" },
    ],
    treeRows: [["almenn_brot"], ["prosentur"], ["hlutfoll"], ["breytithattur"]],
  },
  {
    id: "algebra",
    name: "Algebra",
    icon: "χ",
    accentColor: "#2563eb",
    sections: [
      { id: "mynstur",  name: "Mynstur",         abbr: "M" },
      { id: "breytur",  name: "Breytur",          abbr: "B" },
      { id: "veldi",    name: "Veldi og rætur",   abbr: "VR" },
      { id: "staedur",  name: "Stæður",           abbr: "ST" },
      { id: "stadal",   name: "Staðalform",       abbr: "SF" },
      { id: "jadnur",   name: "Jöfnur",           abbr: "J" },
      { id: "ojadnur",  name: "Ójöfnur",          abbr: "OJ" },
    ],
    treeRows: [
      ["mynstur"],
      ["breytur", "veldi"],
      ["staedur", "stadal"],
      ["jadnur"],
      ["ojadnur"],
    ],
  },
  {
    id: "hnitakerfi",
    name: "Hnitakerfi og föll",
    icon: "f(x)",
    accentColor: "#0891b2",
    sections: [
      { id: "hnitakerfi_sec", name: "Hnitakerfi",    abbr: "H" },
      { id: "hallatala",      name: "Hallatala",     abbr: "HL" },
      { id: "linuleg_foll",   name: "Línuleg föll",  abbr: "LF" },
      { id: "falla_likon",    name: "Falla líkön",   abbr: "FL" },
    ],
    treeRows: [["hnitakerfi_sec"], ["hallatala"], ["linuleg_foll"], ["falla_likon"]],
  },
  {
    id: "rumfraedi",
    name: "Rúmfræði",
    icon: "δ",
    accentColor: "#dc2626",
    sections: [
      { id: "staerdfraediform",      name: "Stærðfræðiform",                  abbr: "FF" },
      { id: "ummal_flatarmal", name: "Ummál og Flatarmál",         abbr: "UF" },
      { id: "rummal",          name: "Rúmmál",                     abbr: "R" },
      { id: "maelikvardi",      name: "Mælikvarðar og mælieiningar", abbr: "MM" },
      { id: "hornafraedi",     name: "Hornafræði",                 abbr: "HF" },
      { id: "pythagoras",      name: "Pýþagóras",                  abbr: "PG" },
    ],
    treeRows: [["staerdfraediform"], ["ummal_flatarmal"], ["rummal"], ["maelikvardi"], ["hornafraedi"], ["pythagoras"]],
  },
  {
    id: "tolfraedi",
    name: "Tölfræði og líkur",
    icon: "σ",
    accentColor: "#d97706",
    sections: [
      { id: "medaltal",      name: "Meðaltal",     abbr: "M" },
      { id: "midgildi",      name: "Miðgildi",     abbr: "MG" },
      { id: "tidasta_gildi", name: "Tíðasta gildi", abbr: "TG" },
      { id: "likur",         name: "Líkur",        abbr: "L" },
      { id: "myndrit",       name: "Myndrit",      abbr: "MJ" },
      { id: "tolkun_grafa",  name: "Túlkun grafa", abbr: "TG" },
      { id: "mengi",         name: "Mengi",        abbr: "MN" },
    ],
    treeRows: [["medaltal"], ["midgildi"], ["tidasta_gildi"], ["likur"], ["myndrit"], ["tolkun_grafa"], ["mengi"]],
  },
  {
    id: "fjarmala",
    name: "Fjármálalæsi",
    icon: "₿",
    accentColor: "#059669",
    sections: [
      { id: "laun",          name: "Laun og launaseðlar",    abbr: "L" },
      { id: "sparnaður",     name: "Sparnaður",              abbr: "S" },
      { id: "vextir",        name: "Vextir",                 abbr: "V" },
      { id: "skattar",       name: "Skattar",                abbr: "SK" },
      { id: "verdbólga",     name: "Verðbólga",              abbr: "VB" },
      { id: "fjarhags",      name: "Fjárhagsáætlun",         abbr: "FJ" },
      { id: "debetkort",     name: "Debetkort og Kreditkort", abbr: "D" },
    ],
    treeRows: [["laun"], ["sparnaður"], ["vextir"], ["skattar"], ["verdbólga"], ["fjarhags"], ["debetkort"]],
  },
];
