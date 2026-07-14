import {
  CATEGORIES,
  LEVELS,
  Level,
  SectionData,
} from "../Data/categories";

export type LevelKey = string;

export const lk = (
  cat: string,
  sec: string,
  level: Level
): LevelKey => `${cat}__${sec}__${level}`;
export function buildPrereqMap(): Record<LevelKey, LevelKey[]> {
  const map: Record<LevelKey, LevelKey[]> = {};
    const addSection = (catId: string, secId: string, firstPrereqs?: LevelKey[]) => {
      if (firstPrereqs) map[lk(catId, secId, "δ")] = firstPrereqs;
      map[lk(catId, secId, "β")] = [lk(catId, secId, "δ")];
      map[lk(catId, secId, "α")] = [lk(catId, secId, "β")];
    };
  
    const addLinear = (catId: string, sections: SectionData[]) => {
      sections.forEach((sec, i) => {
        addSection(catId, sec.id, i > 0 ? [lk(catId, sections[i - 1].id, "α")] : undefined);
      });
    };
  
    addLinear("talnaskilningur", CATEGORIES[0].sections);
    addLinear("brot_og_prosentur", CATEGORIES[1].sections);
  
    // Algebra branching tree (matches image 1)
    addSection("algebra", "mynstur");
    addSection("algebra", "breytur", [lk("algebra", "mynstur", "α")]);
    addSection("algebra", "veldi",   [lk("algebra", "mynstur", "α")]);
    addSection("algebra", "staedur", [lk("algebra", "breytur", "α")]);
    addSection("algebra", "stadal",  [lk("algebra", "veldi",   "α")]);
    addSection("algebra", "jadnur",  [lk("algebra", "staedur", "α"), lk("algebra", "stadal", "α")]);
    addSection("algebra", "ojadnur", [lk("algebra", "jadnur",  "α")]);
  
    addLinear("hnitakerfi", CATEGORIES[3].sections);
    addLinear("rumfraedi",  CATEGORIES[4].sections);
    addLinear("tolfraedi",  CATEGORIES[5].sections);
    addLinear("fjarmala",   CATEGORIES[6].sections);
  
    return map;
  }
  const PREREQS = buildPrereqMap();
  export function isUnlocked(completed: Set<LevelKey>, key: LevelKey): boolean {
  const prereqs = PREREQS[key];
  if (!prereqs || prereqs.length === 0) return true;
  return prereqs.every((p) => completed.has(p));
}
export function categoryProgress(completed: Set<LevelKey>, catId: string): { done: number; total: number } {
  const cat = CATEGORIES.find((c) => c.id === catId)!;
  const total = cat.sections.length * 3;
  const done = cat.sections.reduce(
    (sum, sec) => sum + LEVELS.filter((l) => completed.has(lk(catId, sec.id, l))).length,
    0
  );
  return { done, total };
}
