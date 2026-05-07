import { motion, useReducedMotion } from 'framer-motion';
import { MuteButton } from './MuteButton';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  const reduce = useReducedMotion();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/70 backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-900/70">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <a
          href="/"
          className="group flex items-center gap-3 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-bamboo-400"
        >
          <div className="relative">
            {/* Outer soft glow halo — pulses gently */}
            <motion.span
              aria-hidden
              className="absolute inset-0 -m-1 rounded-2xl bg-gradient-to-br from-sky-400/40 via-bamboo-400/40 to-sunset-400/40 blur-md"
              animate={reduce ? undefined : { opacity: [0.5, 0.9, 0.5] }}
              transition={reduce ? undefined : { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Logo tile — gentle bob */}
            <motion.span
              aria-hidden
              className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-bamboo-400 to-sunset-400 text-2xl shadow-lg ring-1 ring-white/50 dark:ring-white/15"
              animate={reduce ? undefined : { y: [0, -2, 0], rotate: [0, -2, 2, 0] }}
              transition={reduce ? undefined : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              🌏
            </motion.span>
            {/* Sparkle dot — tiny, top-right */}
            <motion.span
              aria-hidden
              className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-[0_0_6px_rgba(251,191,36,0.7)]"
              animate={reduce ? undefined : { scale: [0.6, 1, 0.6], opacity: [0.5, 1, 0.5] }}
              transition={reduce ? undefined : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          <div className="flex flex-col leading-none">
            <span
              className="font-display text-xl font-extrabold tracking-tight sm:text-[1.6rem]"
              style={{
                background: 'linear-gradient(120deg, #15803d 0%, #16a34a 30%, #0ea5e9 70%, #6366f1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Word Safari
            </span>
            <span className="mt-1.5 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
              <span aria-hidden className="h-px w-3 bg-gradient-to-r from-transparent to-slate-400/70 dark:to-slate-500/70" />
              A word adventure
              <span aria-hidden className="h-px w-3 bg-gradient-to-l from-transparent to-slate-400/70 dark:to-slate-500/70" />
            </span>
          </div>
        </a>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <MuteButton />
        </div>
      </div>
    </header>
  );
}
