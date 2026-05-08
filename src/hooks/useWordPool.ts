import { useQuery } from '@tanstack/react-query';
import { fetchCategoryMembers } from '../lib/wikipedia';
import type { Category, Difficulty } from '../lib/types';
import { letterCount } from '../lib/difficulty';

// Wikipedia categories scoped to Asia per game category. Multiple sources
// are merged + de-duplicated. Pick categories that contain article names
// (not list/overview pages) for best filter yield.
// Verified Wikipedia category slugs (counts as of build time):
//   cities  ~120 entries — capitals + selected country pages
//   foods   ~850 entries — pan-cuisine merge
//   animals ~280 entries — Asian fauna across classes
//   sports  ~390 entries — country-specific martial arts (the
//                          generic "Asian_martial_arts" is sparse)
const ASIAN_CATEGORIES: Record<Category, string[]> = {
  cities: [
    'Capital_cities_in_Asia',
    'Cities_in_Indonesia',
    'Cities_in_China',
    'Cities_in_Vietnam',
    'Cities_in_Japan',
    'Cities_in_India',
    'Cities_in_South_Korea',
    'Cities_in_the_Philippines',
  ],
  foods: [
    'Japanese_cuisine',
    'Chinese_cuisine',
    'Indian_cuisine',
    'Korean_cuisine',
    'Thai_cuisine',
    'Vietnamese_cuisine',
    'Indonesian_cuisine',
  ],
  animals: ['Mammals_of_Asia', 'Reptiles_of_Asia', 'Birds_of_Asia'],
  fruits: ['Tropical_fruit', 'Fruits_originating_in_Asia', 'Southeast_Asian_fruits'],
};

// Per-category denylist for Wikipedia titles that pass the structural filter
// but aren't in the spirit of the category. Most prominent: Wikipedia's
// martial-arts categories include the WEAPONS used in those arts (Katar, Urumi,
// Katana, Naginata, Jian, Dao, …) alongside the actual disciplines. Kids are
// guessing the practice, not the weapon. Add to this list as you spot more.
const NOISE_DENYLIST: Record<Category, ReadonlySet<string>> = {
  cities: new Set<string>(),
  animals: new Set<string>(),
  foods: new Set<string>(),
  fruits: new Set<string>(),
  sports: new Set<string>([
    // Indian
    'Katar',
    'Urumi',
    'Talwar',
    'Madu',
    'Khanda',
    'Chakram',
    'Aruval',
    'Lathi',
    'Valari',
    // Japanese
    'Katana',
    'Wakizashi',
    'Naginata',
    'Bokken',
    'Shuriken',
    'Sai',
    'Tonfa',
    'Kama',
    'Nunchaku',
    'Kusarigama',
    'Tanto',
    'Bo',
    'Jo',
    'Yumi',
    // Chinese
    'Jian',
    'Dao',
    'Hudiedao',
    'Liuyedao',
    'Zhanmadao',
    'Guandao',
    'Podao',
    'Niuweidao',
    // Korean
    'Wolto',
    'Hyeopdo',
    'Geom',
  ]),
};

/** Reject Wikipedia titles that aren't fun "guess the word" candidates. */
export function isGuessable(title: string, category?: Category): boolean {
  if (!title) return false;
  // Per-category denylist (e.g. weapons inside martial-arts categories).
  if (category && NOISE_DENYLIST[category].has(title)) return false;
  const lower = title.toLowerCase();
  // Reject overview / list / history articles
  if (
    lower.startsWith('list of') ||
    lower.startsWith('outline of') ||
    lower.startsWith('history of') ||
    lower.startsWith('index of') ||
    lower.startsWith('timeline of') ||
    lower.startsWith('wildlife of') ||
    lower.startsWith('flora of') ||
    lower.startsWith('fauna of') ||
    lower.startsWith('endangered ') ||
    lower.startsWith('extinct ') ||
    lower.startsWith('the ')
  ) {
    return false;
  }
  // Disambiguation suffix
  if (title.includes('(')) return false;
  // Compound titles
  if (title.includes(',') || title.includes(':')) return false;
  // Numbers / dates
  if (/\d/.test(title)) return false;
  // Too many words
  const wordCount = title.trim().split(/\s+/).length;
  if (wordCount > 3) return false;
  // Allowed chars: A-Z a-z space hyphen apostrophe
  if (!/^[a-zA-Z\s'\-]+$/.test(title)) return false;
  // Minimum letter count
  if (letterCount(title) < 3) return false;
  return true;
}

/** Filter pool to titles matching the difficulty bucket. */
export function filterByDifficulty(pool: string[], difficulty: Difficulty): string[] {
  return pool.filter((title) => {
    const n = letterCount(title);
    if (difficulty === 'easy') return n >= 3 && n <= 5;
    if (difficulty === 'medium') return n >= 6 && n <= 8;
    return n >= 9;
  });
}

async function fetchAsianPool(category: Category): Promise<string[]> {
  const cats = ASIAN_CATEGORIES[category];
  const settled = await Promise.allSettled(cats.map((c) => fetchCategoryMembers(c)));
  const out = new Set<string>();
  for (const r of settled) {
    if (r.status === 'fulfilled') {
      for (const t of r.value) {
        if (isGuessable(t, category)) out.add(t);
      }
    }
  }
  return Array.from(out);
}

export function useWordPool(category: Category | null) {
  return useQuery({
    queryKey: ['asian-word-pool', category],
    queryFn: () => fetchAsianPool(category as Category),
    enabled: !!category,
    staleTime: 1000 * 60 * 60 * 24, // 24h — Wikipedia categories don't churn often
    gcTime: 1000 * 60 * 60 * 24 * 7,
    retry: 1,
  });
}
