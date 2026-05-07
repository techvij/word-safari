import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const COLORS = ['#fb7185', '#facc15', '#34d399', '#60a5fa', '#a78bfa', '#fb923c', '#f472b6', '#22d3ee'];
const EMOJIS = ['🎉', '🎊', '✨', '⭐', '🌟', '🥳', '🌈', '💫'];

// Each piece picks one of: dot, square, triangle, ribbon, emoji.
// Mixing shapes makes the confetti feel less "uniform falling spam".
type Shape = 'dot' | 'square' | 'ribbon' | 'emoji';
type Piece = {
  id: number;
  left: number;
  duration: number;
  delay: number;
  color: string;
  emoji: string;
  shape: Shape;
  size: number; // px
  spin: number; // rotation degrees over fall
};

export function Confetti({ count = 60 }: { count?: number }) {
  const [pieces] = useState<Piece[]>(() =>
    Array.from({ length: count }).map((_, i) => {
      const r = Math.random();
      const shape: Shape = r < 0.4 ? 'emoji' : r < 0.65 ? 'dot' : r < 0.85 ? 'square' : 'ribbon';
      return {
        id: i,
        left: Math.random() * 100,
        duration: 2.5 + Math.random() * 1.8,
        delay: Math.random() * 0.7,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        shape,
        size: shape === 'emoji' ? 22 + Math.random() * 12 : 8 + Math.random() * 8,
        spin: 360 + Math.random() * 720,
      };
    }),
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const t = window.setTimeout(() => setMounted(false), 4800);
    return () => window.clearTimeout(t);
  }, []);

  if (!mounted) return null;
  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute -top-6 animate-confetti-fall"
          style={{
            left: `${p.left}%`,
            ['--duration' as string]: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.shape === 'emoji' ? (
            <span style={{ fontSize: p.size, display: 'inline-block', transform: `rotate(${p.spin}deg)` }}>
              {p.emoji}
            </span>
          ) : p.shape === 'square' ? (
            <span
              style={{
                display: 'inline-block',
                width: p.size,
                height: p.size,
                background: p.color,
                borderRadius: 2,
                transform: `rotate(${p.spin}deg)`,
                boxShadow: `0 0 4px ${p.color}40`,
              }}
            />
          ) : p.shape === 'ribbon' ? (
            <span
              style={{
                display: 'inline-block',
                width: p.size * 2.5,
                height: p.size * 0.4,
                background: p.color,
                borderRadius: 999,
                transform: `rotate(${p.spin}deg)`,
                boxShadow: `0 0 4px ${p.color}40`,
              }}
            />
          ) : (
            <span
              style={{
                display: 'inline-block',
                width: p.size,
                height: p.size,
                background: p.color,
                borderRadius: '50%',
                boxShadow: `0 0 6px ${p.color}55`,
              }}
            />
          )}
        </span>
      ))}
    </div>,
    document.body,
  );
}
