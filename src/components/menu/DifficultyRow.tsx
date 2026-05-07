import { motion } from 'framer-motion';
import { useGame } from '../../hooks/useGameState';
import type { Difficulty } from '../../lib/types';
import { cn } from '../../lib/utils';

type Theme = {
  idle: string;
  selected: string;
  halo: string;
  dot: string;
};

// Color story: easy is fresh green, medium is energetic amber, hard is bold rose.
const THEMES: Record<Difficulty, Theme> = {
  easy: {
    idle: 'from-bamboo-50 via-white to-bamboo-100 dark:from-bamboo-950/40 dark:via-slate-900 dark:to-bamboo-900/40 hover:ring-bamboo-300 dark:hover:ring-bamboo-700',
    selected: 'from-bamboo-400 via-bamboo-500 to-bamboo-600 text-white ring-bamboo-200 dark:ring-bamboo-400/40',
    halo: 'rgba(34,197,94,0.5)',
    dot: 'bg-bamboo-500',
  },
  medium: {
    idle: 'from-amber-50 via-white to-amber-100 dark:from-amber-950/40 dark:via-slate-900 dark:to-amber-900/40 hover:ring-amber-300 dark:hover:ring-amber-700',
    selected: 'from-amber-400 via-amber-500 to-amber-600 text-white ring-amber-200 dark:ring-amber-400/40',
    halo: 'rgba(251,191,36,0.5)',
    dot: 'bg-amber-500',
  },
  hard: {
    idle: 'from-rose-50 via-white to-rose-100 dark:from-rose-950/40 dark:via-slate-900 dark:to-rose-900/40 hover:ring-rose-300 dark:hover:ring-rose-700',
    selected: 'from-rose-400 via-rose-500 to-rose-600 text-white ring-rose-200 dark:ring-rose-400/40',
    halo: 'rgba(244,63,94,0.5)',
    dot: 'bg-rose-500',
  },
};

const DIFFS: { id: Difficulty; label: string; sub: string; pips: number }[] = [
  { id: 'easy', label: 'Easy', sub: '3–5 letters · 8 chances', pips: 1 },
  { id: 'medium', label: 'Medium', sub: '6–8 letters · 7 chances', pips: 2 },
  { id: 'hard', label: 'Hard', sub: '9+ letters · 6 chances', pips: 3 },
];

export function DifficultyRow() {
  const { state, selectDifficulty } = useGame();
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
      {DIFFS.map((d) => {
        const selected = state.difficulty === d.id;
        const theme = THEMES[d.id];
        return (
          <motion.button
            key={d.id}
            type="button"
            onClick={() => selectDifficulty(d.id)}
            whileTap={{ scale: 0.96 }}
            whileHover={selected ? undefined : { y: -2 }}
            className={cn(
              'tap-target group relative isolate flex flex-col items-center gap-1 overflow-hidden rounded-2xl bg-gradient-to-br px-3 py-3 font-display font-semibold ring-2 transition-all',
              selected
                ? `${theme.selected} ring-offset-2 ring-offset-white shadow-md dark:ring-offset-slate-900`
                : `${theme.idle} text-slate-700 ring-transparent shadow-sm dark:text-slate-100`,
            )}
            aria-pressed={selected}
          >
            {selected && (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 blur-xl"
                style={{ background: `radial-gradient(circle at 50% 60%, ${theme.halo} 0%, transparent 70%)` }}
              />
            )}

            {/* Difficulty pips: 1, 2, or 3 dots */}
            <span aria-hidden className="flex items-center gap-1 pb-0.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'h-1.5 w-1.5 rounded-full transition-colors',
                    i < d.pips
                      ? selected
                        ? 'bg-white/90'
                        : theme.dot
                      : selected
                        ? 'bg-white/30'
                        : 'bg-slate-300/60 dark:bg-slate-600/60',
                  )}
                />
              ))}
            </span>

            <span className="text-base sm:text-lg">{d.label}</span>
            <span className={cn('text-xs font-normal', selected ? 'text-white/85' : 'opacity-70')}>{d.sub}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
