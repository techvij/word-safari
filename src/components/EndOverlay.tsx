import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useGame } from '../hooks/useGameState';
import { PictureCard } from './PictureCard';
import { cn } from '../lib/utils';

export function EndOverlay() {
  const { state, startRound, backToMenu } = useGame();
  const won = state.phase === 'won';
  const aiRewritten = state.factSource === 'kid-rewrite';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-md"
      aria-modal="true"
      role="dialog"
    >
      <motion.div
        initial={{ y: 30, scale: 0.92 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className={cn(
          'relative flex w-full max-w-md flex-col items-center gap-3 overflow-hidden rounded-[28px] px-6 py-7 shadow-2xl ring-1',
          won
            ? 'bg-gradient-to-br from-white via-bamboo-50 to-sky-50 ring-bamboo-200 dark:from-slate-800 dark:via-slate-800 dark:to-bamboo-950/40 dark:ring-bamboo-700/40'
            : 'bg-gradient-to-br from-white via-rose-50 to-amber-50 ring-rose-200 dark:from-slate-800 dark:via-slate-800 dark:to-rose-950/40 dark:ring-rose-700/40',
        )}
      >
        {/* Top-left + top-right ribbon corners (pure CSS) */}
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full blur-2xl',
            won ? 'bg-bamboo-300/40' : 'bg-rose-300/40',
          )}
        />
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute -right-8 -bottom-8 h-32 w-32 rounded-full blur-2xl',
            won ? 'bg-sky-300/30' : 'bg-amber-300/30',
          )}
        />

        {/* Banner emoji */}
        <motion.div
          className="text-6xl drop-shadow-md"
          animate={won ? { y: [0, -8, 0], rotate: [0, -10, 10, 0] } : { rotate: [0, -5, 5, 0] }}
          transition={{ duration: won ? 1.4 : 0.6, repeat: won ? Infinity : 0, ease: 'easeInOut' }}
        >
          {won ? '🎉' : '💪'}
        </motion.div>

        <PictureCard
          category={state.category}
          word={state.word}
          emoji={state.emoji}
          wikiOverride={state.wikiTitle}
          lost={!won}
        />

        {/* Result heading with gradient */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cn(
            'font-display text-3xl font-extrabold tracking-tight',
            won ? 'text-bamboo-600 dark:text-bamboo-300' : 'text-rose-500 dark:text-rose-300',
          )}
          style={
            won
              ? {
                  background: 'linear-gradient(120deg, #16a34a 0%, #0ea5e9 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }
              : undefined
          }
        >
          {won ? 'You got it!' : 'So close!'}
        </motion.h2>

        {/* Word reveal — chunky display type */}
        <div className="relative">
          <span
            aria-hidden
            className={cn(
              'absolute inset-x-2 -bottom-1 h-1 rounded-full',
              won ? 'bg-bamboo-300/50' : 'bg-rose-300/50',
            )}
          />
          <div className="relative font-display text-3xl font-extrabold tracking-wide text-slate-800 dark:text-slate-100">
            {state.word}
          </div>
        </div>

        {/* Fact + AI badge */}
        <div className="flex flex-col items-center gap-1.5 px-2">
          <p className="text-center text-sm leading-relaxed text-slate-600 dark:text-slate-300">{state.fact}</p>
          {aiRewritten && (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-bamboo-100 to-sky-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-bamboo-700 ring-1 ring-bamboo-200 dark:from-bamboo-800/40 dark:to-sky-800/40 dark:text-bamboo-200 dark:ring-bamboo-700/50"
              title="Rewritten by Claude for kids"
            >
              <Sparkles className="h-3 w-3" />
              Rewritten for kids
            </span>
          )}
        </div>

        <div className="mt-2 flex w-full flex-col gap-2 sm:flex-row">
          <motion.button
            type="button"
            onClick={startRound}
            whileTap={{ scale: 0.97 }}
            whileHover={{ y: -2 }}
            className="tap-target relative flex-1 overflow-hidden rounded-2xl bg-gradient-to-br from-bamboo-400 via-bamboo-500 to-bamboo-600 px-4 py-3 font-display font-semibold text-white shadow-md ring-2 ring-bamboo-300/50 hover:shadow-lg"
          >
            <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent" />
            <span className="relative">Play Again</span>
          </motion.button>
          <motion.button
            type="button"
            onClick={backToMenu}
            whileTap={{ scale: 0.97 }}
            whileHover={{ y: -2 }}
            className="tap-target flex-1 rounded-2xl bg-white px-4 py-3 font-display font-semibold text-slate-700 shadow-md ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-700 dark:text-slate-100 dark:ring-slate-600 dark:hover:bg-slate-600"
          >
            Main Menu
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
