import { motion } from 'framer-motion';
import { useGame } from '../../hooks/useGameState';
import type { Category } from '../../lib/types';
import { cn } from '../../lib/utils';

type Theme = {
  // idle: subtle tinted background; ring border is invisible until hover
  idle: string;
  // selected: full themed gradient with white text
  selected: string;
  // halo: blurred glow color shown when selected (rgba — used inline)
  halo: string;
};

const THEMES: Record<Category, Theme> = {
  cities: {
    idle: 'from-sky-50 via-white to-sky-100 dark:from-sky-950/40 dark:via-slate-900 dark:to-sky-900/40 hover:ring-sky-300 dark:hover:ring-sky-700',
    selected: 'from-sky-400 via-sky-500 to-sky-600 text-white ring-sky-200 dark:ring-sky-400/40',
    halo: 'rgba(14,165,233,0.55)',
  },
  fruits: {
    idle: 'from-sunset-50 via-white to-sunset-100 dark:from-sunset-950/40 dark:via-slate-900 dark:to-sunset-900/40 hover:ring-sunset-300 dark:hover:ring-sunset-700',
    selected: 'from-sunset-400 via-sunset-500 to-sunset-600 text-white ring-sunset-200 dark:ring-sunset-400/40',
    halo: 'rgba(249,115,22,0.55)',
  },
  animals: {
    idle: 'from-bamboo-50 via-white to-bamboo-100 dark:from-bamboo-950/40 dark:via-slate-900 dark:to-bamboo-900/40 hover:ring-bamboo-300 dark:hover:ring-bamboo-700',
    selected: 'from-bamboo-400 via-bamboo-500 to-bamboo-600 text-white ring-bamboo-200 dark:ring-bamboo-400/40',
    halo: 'rgba(34,197,94,0.55)',
  },
  foods: {
    idle: 'from-berry-50/60 via-white to-pink-100 dark:from-pink-950/40 dark:via-slate-900 dark:to-berry-900/40 hover:ring-berry-300 dark:hover:ring-berry-700',
    selected: 'from-berry-400 via-berry-500 to-berry-600 text-white ring-berry-200 dark:ring-berry-400/40',
    halo: 'rgba(236,72,153,0.55)',
  },
};

const CATEGORIES: { id: Category; label: string; emoji: string }[] = [
  { id: 'cities', label: 'Cities', emoji: '🏙️' },
  { id: 'fruits', label: 'Fruits', emoji: '🍍' },
  { id: 'animals', label: 'Animals', emoji: '🐼' },
  { id: 'foods', label: 'Foods', emoji: '🍜' },
];

export function CategoryGrid() {
  const { state, selectCategory } = useGame();
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {CATEGORIES.map((c) => {
        const selected = state.category === c.id;
        const theme = THEMES[c.id];
        return (
          <motion.button
            key={c.id}
            type="button"
            onClick={() => selectCategory(c.id)}
            whileTap={{ scale: 0.96 }}
            whileHover={selected ? undefined : { y: -2 }}
            className={cn(
              'tap-target group relative isolate flex min-h-28 flex-col items-center justify-center gap-1.5 overflow-hidden rounded-3xl bg-gradient-to-br p-4 font-display font-semibold ring-2 transition-all',
              selected
                ? `${theme.selected} ring-offset-2 ring-offset-white shadow-lg dark:ring-offset-slate-900`
                : `${theme.idle} text-slate-700 ring-transparent shadow-sm dark:text-slate-100`,
            )}
            aria-pressed={selected}
          >
            {/* Selection halo — soft glow behind content */}
            {selected && (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 blur-2xl"
                style={{ background: `radial-gradient(circle at 50% 60%, ${theme.halo} 0%, transparent 65%)` }}
              />
            )}
            {/* Top sheen — only when not selected, gives a subtle "card" feel */}
            {!selected && (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/60 to-transparent dark:from-white/5"
              />
            )}
            <motion.span
              className="text-4xl drop-shadow-sm sm:text-5xl"
              animate={selected ? { rotate: [0, -8, 8, -4, 0] } : {}}
              transition={selected ? { duration: 0.6, ease: 'easeInOut' } : {}}
            >
              {c.emoji}
            </motion.span>
            <span className="text-base sm:text-lg">{c.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
