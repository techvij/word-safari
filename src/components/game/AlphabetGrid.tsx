import { motion } from 'framer-motion';
import { useGame } from '../../hooks/useGameState';
import { cn } from '../../lib/utils';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function AlphabetGrid() {
  const { guess, letterStatus, state } = useGame();
  const disabled = state.phase !== 'playing';

  return (
    <div className="grid grid-cols-7 gap-1.5 sm:grid-cols-9 sm:gap-2" role="group" aria-label="Alphabet">
      {LETTERS.map((L) => {
        const status = letterStatus(L);
        const isUsed = !!status;
        return (
          <motion.button
            key={L}
            type="button"
            disabled={disabled || isUsed}
            onClick={() => guess(L)}
            whileTap={!disabled && !isUsed ? { scale: 1.15 } : undefined}
            whileHover={!disabled && !isUsed ? { y: -2 } : undefined}
            transition={{ duration: 0.15 }}
            className={cn(
              'tap-target group relative isolate flex items-center justify-center overflow-hidden rounded-xl font-display text-base font-extrabold shadow-sm transition-all',
              'disabled:cursor-default',
              status === 'correct' &&
                'bg-gradient-to-b from-bamboo-400 to-bamboo-600 text-white shadow-md ring-1 ring-bamboo-300/60 dark:ring-bamboo-400/30',
              status === 'wrong' &&
                'bg-slate-200 text-slate-400 line-through opacity-70 dark:bg-slate-700/70 dark:text-slate-500',
              !status &&
                'bg-gradient-to-b from-white to-slate-100 text-slate-800 ring-1 ring-slate-200 hover:from-sky-50 hover:to-sky-100 hover:ring-sky-300 dark:from-slate-700 dark:to-slate-800 dark:text-slate-100 dark:ring-slate-700 dark:hover:from-slate-700 dark:hover:to-slate-700 dark:hover:ring-sky-700',
            )}
            aria-label={`Guess letter ${L}`}
            data-letter={L}
          >
            {/* Top sheen — subtle 3D feel */}
            {!isUsed && (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/50 to-transparent dark:from-white/10"
              />
            )}
            {/* Correct-answer glow ping */}
            {status === 'correct' && (
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-xl"
                style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.8, 0] }}
                transition={{ duration: 0.6 }}
              />
            )}
            <span className="relative">{L}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
