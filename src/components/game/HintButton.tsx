import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import { useGame } from '../../hooks/useGameState';
import { cn } from '../../lib/utils';

export function HintButton() {
  const { state, useHint } = useGame();
  const upper = state.word.toUpperCase();
  const hasUnrevealed = Array.from(upper).some((ch, i) => /[A-Z]/.test(ch) && !state.revealed.has(i));
  const disabled = state.phase !== 'playing' || state.chancesLeft <= 1 || !hasUnrevealed;

  return (
    <motion.button
      type="button"
      onClick={useHint}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      whileHover={disabled ? undefined : { y: -2 }}
      className={cn(
        'tap-target group relative isolate inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl px-5 py-3 font-display font-semibold text-white shadow-md transition-all',
        'bg-gradient-to-br from-sunset-400 via-sunset-500 to-sunset-600 ring-2 ring-sunset-300/50 hover:shadow-lg',
        'disabled:bg-slate-300 disabled:bg-none disabled:text-slate-500 disabled:shadow-none disabled:ring-transparent dark:disabled:bg-slate-700 dark:disabled:text-slate-500',
      )}
    >
      {/* Top sheen */}
      {!disabled && (
        <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent" />
      )}
      {/* Lightbulb glow when active */}
      {!disabled && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute -left-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(252,211,77,0.55) 0%, transparent 70%)' }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      <Lightbulb className="relative h-5 w-5" fill={disabled ? 'transparent' : 'rgba(252,211,77,0.4)'} />
      <span className="relative">
        Hint <span className="text-xs opacity-80">(-1 chance)</span>
      </span>
    </motion.button>
  );
}
