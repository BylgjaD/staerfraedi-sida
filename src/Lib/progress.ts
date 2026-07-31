import {
  CATEGORIES,
  LEVELS,
  SectionData,
} from "../data/categories";
import type { Level } from "../lib/types";

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
      // Breytt: næsti hluti opnast á Delta þegar fyrri hluti hefur náð Delta (ekki Alfa)
      addSection(catId, sec.id, i > 0 ? [lk(catId, sections[i - 1].id, "δ")] : undefined);
    });
  };

  addLinear("talnaskilningur", CATEGORIES[0].sections);
  addLinear("brot_og_prosentur", CATEGORIES[1].sections);

  // Algebra branching tree - breytt úr "α" í "δ" fyrir tengsl milli hluta
  addSection("algebra", "mynstur");
  addSection("algebra", "breytur", [lk("algebra", "mynstur", "δ")]);
  addSection("algebra", "veldi",   [lk("algebra", "mynstur", "δ")]);
  addSection("algebra", "staedur", [lk("algebra", "breytur", "δ")]);
  addSection("algebra", "stadal",  [lk("algebra", "veldi",   "δ")]);
  addSection("algebra", "jadnur",  [lk("algebra", "staedur", "δ"), lk("algebra", "stadal", "δ")]);
  addSection("algebra", "ojadnur", [lk("algebra", "jadnur",  "δ")]);

  addLinear("hnitakerfi", CATEGORIES[3].sections);
  addLinear("rumfraedi",  CATEGORIES[4].sections);
  addLinear("tolfraedi",  CATEGORIES[5].sections);
  addLinear("fjarmala",   CATEGORIES[6].sections);

  return map;
}

const PREREQS = buildPrereqMap();

export function isUnlocked(completed: LevelKey[], key: LevelKey): boolean {
  const prereqs = PREREQS[key];
  if (!prereqs || prereqs.length === 0) return true;
  return prereqs.every((p) => completed.includes(p));
}

export function categoryProgress(
  completed: LevelKey[],
  catId: string
): { done: number; total: number } {
  const cat = CATEGORIES.find((c) => c.id === catId)!;

  const total = cat.sections.length * 3;

  const done = cat.sections.reduce(
    (sum, sec) =>
      sum +
      LEVELS.filter((l) =>
        completed.includes(lk(catId, sec.id, l))
      ).length,
    0
  );

  return { done, total };
}
