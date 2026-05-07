import { Flag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGame } from '../../hooks/useGameState';
import { cn } from '../../lib/utils';

export function GiveUpButton() {
  const { state, giveUp } = useGame();
  const disabled = state.phase !== 'playing';

  return (
    <motion.button
      type="button"
      onClick={giveUp}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      aria-label="Give up and reveal the word"
      className={cn(
        'tap-target inline-flex items-center justify-center gap-2 rounded-2xl border-2 px-5 py-3 font-display font-semibold transition',
        'border-slate-300 bg-white text-slate-600 shadow-sm',
        'hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 active:scale-[0.98]',
        'dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
        'dark:hover:border-rose-700 dark:hover:bg-rose-900/30 dark:hover:text-rose-300',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-300 disabled:hover:bg-white disabled:hover:text-slate-600 dark:disabled:hover:border-slate-700 dark:disabled:hover:bg-slate-800 dark:disabled:hover:text-slate-300',
      )}
    >
      <Flag className="h-4 w-4" />
      Give Up
    </motion.button>
  );
}
