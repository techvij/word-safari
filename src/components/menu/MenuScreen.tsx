import { motion } from 'framer-motion';
import { AlertCircle, Globe, Loader2 } from 'lucide-react';
import { useGame } from '../../hooks/useGameState';
import { CategoryGrid } from './CategoryGrid';
import { DifficultyRow } from './DifficultyRow';
import { ScoreCard } from './ScoreCard';
import { cn } from '../../lib/utils';

export function MenuScreen() {
  const { state, startRound, poolStatus, poolSize } = useGame();
  const ready = !!state.category && !!state.difficulty;

  return (
    <div className="flex flex-col gap-5 pt-4">
      <ScoreCard />

      <section>
        <h2 className="mb-2 font-display text-lg font-bold text-slate-700 dark:text-slate-200">Pick a category</h2>
        <CategoryGrid />
      </section>

      <section>
        <h2 className="mb-2 font-display text-lg font-bold text-slate-700 dark:text-slate-200">Pick a difficulty</h2>
        <DifficultyRow />
      </section>

      {state.loadError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-2xl border border-rose-300/60 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-700/50 dark:bg-rose-950/40 dark:text-rose-200"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.loadError}</span>
        </div>
      )}

      <div className="relative">
        {/* Outer glow that intensifies when ready */}
        {ready && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 -m-1 rounded-3xl blur-xl"
            style={{ background: 'linear-gradient(120deg, #4ade80 0%, #22c55e 40%, #0ea5e9 100%)' }}
            animate={{ opacity: [0.55, 0.85, 0.55] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        <motion.button
          type="button"
          onClick={() => void startRound()}
          disabled={!ready}
          whileTap={ready ? { scale: 0.97 } : undefined}
          animate={ready ? { scale: [1, 1.025, 1] } : {}}
          transition={ready ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } : {}}
          className={cn(
            'tap-target relative w-full overflow-hidden rounded-3xl px-8 py-4 font-display text-2xl font-bold text-white shadow-lg transition',
            ready
              ? 'bg-gradient-to-br from-bamboo-400 via-bamboo-500 to-bamboo-600 ring-2 ring-bamboo-300/50'
              : 'cursor-not-allowed bg-slate-300 text-slate-500 dark:bg-slate-700 dark:text-slate-500',
          )}
        >
          {ready && (
            <>
              {/* Shimmer sweep */}
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ x: ['0%', '500%'] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.4 }}
              />
              {/* Top highlight */}
              <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent" />
            </>
          )}
          <span className="relative inline-flex items-center justify-center gap-2">
            Start!
            <motion.span
              aria-hidden
              animate={ready ? { y: [0, -3, 0], rotate: [0, -8, 8, 0] } : {}}
              transition={ready ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } : {}}
            >
              🚀
            </motion.span>
          </span>
        </motion.button>
      </div>

      <div className="flex justify-center pt-1">
        <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
          {poolStatus === 'loading' ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" /> fetching Asian {state.category ?? 'words'} from Wikipedia…
            </>
          ) : poolStatus === 'ready' ? (
            <>
              <Globe className="h-3 w-3 text-bamboo-500" />
              {poolSize} {state.category ?? ''} words live from Wikipedia
            </>
          ) : poolStatus === 'error' ? (
            <>
              <AlertCircle className="h-3 w-3 text-rose-500" /> Wikipedia unreachable — pick a category to retry
            </>
          ) : (
            <>
              <Globe className="h-3 w-3" /> words pulled live from Wikipedia · pick a category to start
            </>
          )}
        </span>
      </div>
    </div>
  );
}
