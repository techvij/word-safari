import { motion } from 'framer-motion';
import { useGame } from '../../hooks/useGameState';
import { cn } from '../../lib/utils';

export function WordDisplay() {
  const { state } = useGame();
  const word = state.word;
  return (
    <div className="flex flex-wrap justify-center gap-1.5 px-2 sm:gap-2" role="status" aria-live="polite">
      {Array.from(word).map((ch, i) => {
        const isLetter = /[a-zA-Z]/.test(ch);
        if (!isLetter) {
          // Word break — visible gap so multi-word phrases read clearly.
          return <span key={i} className="w-3 sm:w-4" aria-hidden />;
        }
        const revealed = state.revealed.has(i);
        return (
          <motion.span
            key={i}
            className={cn(
              'relative flex h-12 min-w-9 items-center justify-center rounded-xl px-1.5 font-display text-2xl font-extrabold transition-colors',
              'sm:h-14 sm:min-w-11 sm:text-3xl',
              revealed
                ? 'bg-gradient-to-b from-bamboo-100 to-bamboo-200 text-bamboo-700 shadow-sm dark:from-bamboo-700/50 dark:to-bamboo-800/50 dark:text-bamboo-100'
                : 'bg-slate-200/60 text-slate-400 dark:bg-slate-800/60 dark:text-slate-500',
            )}
            initial={false}
            animate={revealed ? { y: [0, -4, 0] } : {}}
            transition={revealed ? { duration: 0.4, ease: 'easeOut' } : {}}
          >
            {/* Bottom accent rule — green when revealed, slate when hidden */}
            <span
              aria-hidden
              className={cn(
                'pointer-events-none absolute inset-x-1.5 bottom-1 h-0.5 rounded-full transition-colors',
                revealed ? 'bg-bamboo-500/70' : 'bg-slate-400/60 dark:bg-slate-600/60',
              )}
            />
            {revealed && (
              <motion.span
                key="shown"
                initial={{ scale: 0.5, opacity: 0, rotateX: -90 }}
                animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                transition={{ type: 'spring', stiffness: 360, damping: 18 }}
                className="relative"
              >
                {ch.toUpperCase()}
              </motion.span>
            )}
          </motion.span>
        );
      })}
    </div>
  );
}
