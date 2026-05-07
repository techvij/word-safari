import { motion } from 'framer-motion';

const ORBITERS = ['🐼', '🍜', '🏙️', '🥋'];

export function LoadingScreen() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-5 pt-16 sm:pt-20"
      role="status"
      aria-live="polite"
    >
      {/* Orbiting category emojis around the spinning globe */}
      <div className="relative h-32 w-32 sm:h-40 sm:w-40">
        {/* Soft glow halo */}
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full blur-2xl"
          style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.35) 0%, transparent 65%)' }}
          animate={{ opacity: [0.5, 0.9, 0.5], scale: [1, 1.08, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Orbiters */}
        {ORBITERS.map((emoji, i) => {
          const angle = (i / ORBITERS.length) * Math.PI * 2;
          return (
            <motion.span
              key={emoji}
              aria-hidden
              className="absolute left-1/2 top-1/2 -ml-3 -mt-3 text-2xl"
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear', delay: -i * 1.5 }}
              style={{ transformOrigin: '0 0' }}
            >
              <span
                style={{
                  display: 'inline-block',
                  transform: `rotate(${angle}rad) translateX(56px) rotate(${-angle}rad)`,
                }}
              >
                {emoji}
              </span>
            </motion.span>
          );
        })}

        {/* Center globe — bobbing + rotating in place */}
        <motion.span
          aria-hidden
          className="absolute inset-0 flex items-center justify-center text-7xl drop-shadow-lg sm:text-8xl"
          animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          🌏
        </motion.span>
      </div>

      {/* Heading with animated dots */}
      <motion.p
        className="flex items-center gap-1 font-display text-xl font-bold text-bamboo-700 dark:text-bamboo-300"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span>Searching Asia for a word</span>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            aria-hidden
            animate={{ opacity: [0.2, 1, 0.2], y: [0, -2, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.18 }}
          >
            .
          </motion.span>
        ))}
      </motion.p>

      <p className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">
        <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-bamboo-500" />
        Live from Wikipedia
      </p>
    </div>
  );
}
