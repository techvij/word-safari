import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '../../hooks/useGameState';

const HEART_PATH =
  'M12 21s-7-4.534-9.5-9.5C.5 6.5 4.5 2 9 4.5c1.5.834 2.5 2 3 3 .5-1 1.5-2.166 3-3C19.5 2 23.5 6.5 21.5 11.5 19 16.466 12 21 12 21z';

type Particle = { id: number; key: string; x: number; y: number; dx: number; dy: number };

export function Hearts() {
  const { state } = useGame();
  const { maxChances, chancesLeft } = state;
  const total = maxChances;
  const lostCount = maxChances - chancesLeft;
  const containerRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const prevLost = useRef(0);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (lostCount <= prevLost.current) {
      prevLost.current = lostCount;
      return;
    }
    prevLost.current = lostCount;
    const slot = slotRefs.current[lostCount - 1];
    if (!slot) return;
    const rect = slot.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const stamp = Date.now();
    const burst: Particle[] = Array.from({ length: 8 }).map((_, i) => {
      const angle = (i / 8) * Math.PI * 2;
      return {
        id: stamp + i,
        key: `${stamp}-${i}`,
        x: cx,
        y: cy,
        dx: Math.cos(angle) * 40,
        dy: Math.sin(angle) * 40 - 20,
      };
    });
    const burstKeys = new Set(burst.map((b) => b.key));
    setParticles((p) => [...p, ...burst]);
    const tid = window.setTimeout(() => {
      setParticles((p) => p.filter((q) => !burstKeys.has(q.key)));
    }, 750);
    return () => window.clearTimeout(tid);
  }, [lostCount]);

  return (
    <div ref={containerRef} className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, i) => {
        const isLost = i < lostCount;
        // Stagger the heartbeat phase per-heart so they pulse in a wave, not in lockstep.
        const phaseDelay = `-${(i * 0.18).toFixed(2)}s`;
        return (
          <span
            key={i}
            ref={(el) => (slotRefs.current[i] = el)}
            className="relative inline-block h-6 w-6"
            aria-hidden="true"
          >
            <AnimatePresence mode="wait">
              {!isLost ? (
                <motion.svg
                  key="alive"
                  viewBox="0 0 24 24"
                  className="absolute inset-0 h-full w-full animate-heartbeat drop-shadow-[0_0_4px_rgba(255,61,114,0.45)]"
                  style={{ animationDelay: phaseDelay }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 1.4, rotate: 30, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <path d={HEART_PATH} fill="url(#heart-gradient)" />
                  {/* Inner highlight — adds a 3D sheen on top-left of the heart */}
                  <path
                    d="M9 6.5c-1.5-.5-3 0-4 1.2 0 0 .5-.6 1.5-.6.6 0 1.2.2 1.6.5.5.4.7 1 .9 1.4"
                    fill="none"
                    stroke="rgba(255,255,255,0.55)"
                    strokeWidth={1.2}
                    strokeLinecap="round"
                  />
                </motion.svg>
              ) : (
                <motion.svg
                  key="lost"
                  viewBox="0 0 24 24"
                  className="absolute inset-0 h-full w-full"
                  initial={{ scale: 1, opacity: 1, rotate: 0 }}
                  animate={{ scale: [1, 1.4, 0.9, 0], rotate: [0, -12, 15, 40], opacity: [1, 1, 0.6, 0] }}
                  transition={{ duration: 0.65, ease: 'easeOut' }}
                >
                  <path d={HEART_PATH} fill="#cbd5e1" />
                </motion.svg>
              )}
            </AnimatePresence>
          </span>
        );
      })}
      <svg width={0} height={0} className="absolute">
        <defs>
          <linearGradient id="heart-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffb3c8" />
            <stop offset="55%" stopColor="#ff6e9c" />
            <stop offset="100%" stopColor="#e0246e" />
          </linearGradient>
        </defs>
      </svg>
      {particles.map((p) => (
        <span
          key={p.key}
          className="heart-particle"
          style={{ left: p.x, top: p.y, ['--dx' as string]: `${p.dx}px`, ['--dy' as string]: `${p.dy}px` }}
        >
          💔
        </span>
      ))}
    </div>
  );
}
