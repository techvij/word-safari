import { motion } from 'framer-motion';
import { RotateCcw, Trophy } from 'lucide-react';
import { useGame } from '../../hooks/useGameState';
import { cn } from '../../lib/utils';

export function ScoreCard() {
  const { state, resetScore } = useGame();
  const score = state.score;
  const hasScore = score > 0;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl border p-4 shadow-md transition-colors',
        'border-bamboo-200/70 bg-gradient-to-br from-white to-bamboo-50',
        'dark:border-bamboo-800/40 dark:from-slate-800 dark:to-slate-800/60',
      )}
    >
      {hasScore && (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-bamboo-300/30 blur-3xl dark:bg-bamboo-400/20"
        />
      )}

      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-md transition-colors',
              hasScore
                ? 'bg-gradient-to-br from-bamboo-400 to-bamboo-600'
                : 'bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700',
            )}
          >
            <Trophy className="h-6 w-6 text-white" strokeWidth={2.5} />
          </div>

          <div className="flex flex-col leading-tight">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Games won
            </span>
            <motion.span
              key={score}
              initial={{ scale: 0.5, opacity: 0, y: 6 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 360, damping: 18 }}
              className={cn(
                'font-display text-3xl font-extrabold tracking-tight',
                hasScore
                  ? 'bg-gradient-to-br from-bamboo-500 to-bamboo-700 bg-clip-text text-transparent dark:from-bamboo-300 dark:to-bamboo-500'
                  : 'text-slate-400 dark:text-slate-500',
              )}
            >
              {score}
            </motion.span>
          </div>
        </div>

        <motion.button
          type="button"
          onClick={resetScore}
          disabled={!hasScore}
          aria-label="Reset score"
          whileTap={hasScore ? { scale: 0.92 } : undefined}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition',
            hasScore
              ? 'bg-white/70 text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-white dark:bg-slate-700/70 dark:text-slate-100 dark:ring-slate-600 dark:hover:bg-slate-700'
              : 'cursor-not-allowed text-slate-400 opacity-60 dark:text-slate-500',
          )}
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </motion.button>
      </div>
    </div>
  );
}
