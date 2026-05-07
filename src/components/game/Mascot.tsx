import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { MOUTH_PATHS, useMascotState } from '../../hooks/useMascotAnimation';
import type { MascotName } from '../../lib/types';

export function Mascot() {
  const { mouth, tears, mascot, shakeNonce, happyNonce, sadness } = useMascotState();
  const reduce = useReducedMotion();

  const wrapperAnim = happyNonce > 0
    ? {
        animate: { y: [0, -16, 0], scale: [1, 1.06, 0.97, 1] },
        transition: { duration: 0.55, ease: 'easeOut' as const },
      }
    : shakeNonce > 0
    ? {
        animate: { x: [0, -8, 8, -6, 6, 0], rotate: [0, -3, 3, -2, 2, 0] },
        transition: { duration: 0.45 },
      }
    : { animate: {}, transition: {} };

  // Halo color shifts with mood: bamboo green when happy, rose-tinted when sad.
  const haloFromColor = sadness < 0.5 ? 'rgba(34,197,94,0.22)' : 'rgba(244,114,182,0.22)';

  return (
    <div
      className="relative mx-auto flex h-44 w-44 items-center justify-center sm:h-56 sm:w-56"
      aria-label="Friendly mascot"
      role="img"
    >
      {/* Ambient halo behind mascot */}
      <motion.div
        aria-hidden
        className="absolute inset-0 -m-4 rounded-full blur-2xl"
        style={{ background: `radial-gradient(circle, ${haloFromColor} 0%, transparent 65%)` }}
        animate={reduce ? undefined : { scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
        transition={reduce ? undefined : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        key={`${shakeNonce}-${happyNonce}`}
        {...(reduce ? {} : wrapperAnim)}
        className="absolute inset-0"
      >
        <div className="h-full w-full animate-float-bob">
          <svg viewBox="0 0 200 200" className="h-full w-full drop-shadow-lg">
            <defs>
              {/* Subtle vertical face gradient — adds depth without being noticeable. */}
              <radialGradient id="panda-face" cx="0.5" cy="0.4" r="0.7">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f0eae3" />
              </radialGradient>
              <radialGradient id="red-panda-face" cx="0.5" cy="0.4" r="0.7">
                <stop offset="0%" stopColor="#e08755" />
                <stop offset="100%" stopColor="#c0612e" />
              </radialGradient>
              <radialGradient id="tiger-face" cx="0.5" cy="0.4" r="0.7">
                <stop offset="0%" stopColor="#ffaa55" />
                <stop offset="100%" stopColor="#e07820" />
              </radialGradient>
              {/* Eye-white inner glow for kawaii sparkle */}
              <radialGradient id="eye-shine" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#e0e8f0" />
              </radialGradient>
            </defs>

            <ellipse cx={100} cy={180} rx={55} ry={14} fill="#000" opacity={0.1} />

            {mascot === 'panda' && <PandaBody />}
            {mascot === 'red-panda' && <RedPandaBody />}
            {mascot === 'tiger' && <TigerBody />}

            {/* shared face: nose, mouth, tears */}
            <ellipse cx={100} cy={124} rx={7.5} ry={5} fill="#2c2c2c" />
            {/* Nose highlight — tiny dot for sheen */}
            <ellipse cx={97.5} cy={122} rx={1.8} ry={1.2} fill="#ffffff" opacity={0.5} />
            <path d="M100 129 L100 134" stroke="#2c2c2c" strokeWidth={2} fill="none" strokeLinecap="round" />
            <motion.path
              key={mouth}
              d={MOUTH_PATHS[mouth]}
              stroke="#2c2c2c"
              strokeWidth={3.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ strokeWidth: 5.5 }}
              animate={{ strokeWidth: 3.5 }}
              transition={{ duration: 0.4 }}
            />

            <AnimatePresence>
              {tears[0] && (
                <motion.path
                  key="tear-1"
                  d="M68 112 Q64 122 68 130 Q72 122 68 112 Z"
                  fill="#5cb8e6"
                  initial={{ opacity: 0, y: -8, scale: 0.4 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.45 }}
                />
              )}
              {tears[1] && (
                <motion.path
                  key="tear-2"
                  d="M132 112 Q128 122 132 130 Q136 122 132 112 Z"
                  fill="#5cb8e6"
                  initial={{ opacity: 0, y: -8, scale: 0.4 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.45 }}
                />
              )}
              {tears[2] && (
                <motion.path
                  key="tear-3"
                  d="M100 150 Q96 162 100 170 Q104 162 100 150 Z"
                  fill="#5cb8e6"
                  initial={{ opacity: 0, y: -8, scale: 0.4 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.45 }}
                />
              )}
            </AnimatePresence>
          </svg>
        </div>
      </motion.div>
    </div>
  );
}

export function MascotPreview({ name, size = 80 }: { name: MascotName; size?: number }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size}>
      <defs>
        <radialGradient id="panda-face-pv" cx="0.5" cy="0.4" r="0.7">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f0eae3" />
        </radialGradient>
      </defs>
      {name === 'panda' && <PandaBody />}
      {name === 'red-panda' && <RedPandaBody />}
      {name === 'tiger' && <TigerBody />}
      <ellipse cx={100} cy={124} rx={7.5} ry={5} fill="#2c2c2c" />
      <path d={MOUTH_PATHS.smile} stroke="#2c2c2c" strokeWidth={3.5} fill="none" strokeLinecap="round" />
    </svg>
  );
}

function PandaBody() {
  return (
    <g>
      {/* Ears — outer and inner with depth */}
      <circle cx={60} cy={48} r={22} fill="#2c2c2c" />
      <circle cx={60} cy={50} r={11} fill="#a87875" />
      <circle cx={140} cy={48} r={22} fill="#2c2c2c" />
      <circle cx={140} cy={50} r={11} fill="#a87875" />
      {/* Face — subtle radial gradient for depth */}
      <ellipse cx={100} cy={105} rx={68} ry={62} fill="url(#panda-face)" stroke="#3a2e2e" strokeWidth={2} />
      {/* Pink rosy cheeks — kawaii touch */}
      <ellipse cx={60} cy={130} rx={11} ry={6} fill="#ffb3c1" opacity={0.55} />
      <ellipse cx={140} cy={130} rx={11} ry={6} fill="#ffb3c1" opacity={0.55} />
      {/* Eye patches — slightly larger and rounder */}
      <ellipse cx={76} cy={98} rx={15} ry={19} fill="#2c2c2c" transform="rotate(-12 76 98)" />
      <ellipse cx={124} cy={98} rx={15} ry={19} fill="#2c2c2c" transform="rotate(12 124 98)" />
      {/* Bigger eye whites with subtle gradient sheen */}
      <circle cx={76} cy={100} r={8} fill="url(#eye-shine)" />
      <circle cx={124} cy={100} r={8} fill="url(#eye-shine)" />
      {/* Bigger pupils — anime/kawaii style */}
      <circle cx={77} cy={101} r={4.5} fill="#1a1a1a" />
      <circle cx={125} cy={101} r={4.5} fill="#1a1a1a" />
      {/* Pupil shine highlights — adds the "alive" feel */}
      <circle cx={78.5} cy={98.5} r={1.7} fill="#ffffff" />
      <circle cx={126.5} cy={98.5} r={1.7} fill="#ffffff" />
      <circle cx={75.5} cy={102} r={0.8} fill="#ffffff" opacity={0.7} />
      <circle cx={123.5} cy={102} r={0.8} fill="#ffffff" opacity={0.7} />
    </g>
  );
}

function RedPandaBody() {
  return (
    <g>
      {/* Ears */}
      <path d="M48 50 L60 22 L75 48 Z" fill="#5a3a28" />
      <path d="M152 50 L140 22 L125 48 Z" fill="#5a3a28" />
      <path d="M55 47 L62 32 L70 47 Z" fill="#f5d8b8" />
      <path d="M145 47 L138 32 L130 47 Z" fill="#f5d8b8" />
      {/* Face with depth gradient */}
      <ellipse cx={100} cy={105} rx={68} ry={62} fill="url(#red-panda-face)" stroke="#5a3a28" strokeWidth={2} />
      {/* Side fur */}
      <path d="M62 95 Q56 132 78 148 Q74 132 82 102 Z" fill="#f5d8b8" />
      <path d="M138 95 Q144 132 122 148 Q126 132 118 102 Z" fill="#f5d8b8" />
      {/* Cream mask above eyes */}
      <path d="M82 84 Q100 70 118 84 Q100 92 82 84 Z" fill="#f5d8b8" />
      {/* Cheeks — warm rose, subtle on the rust face */}
      <ellipse cx={68} cy={120} rx={9} ry={5} fill="#ff7a8c" opacity={0.4} />
      <ellipse cx={132} cy={120} rx={9} ry={5} fill="#ff7a8c" opacity={0.4} />
      {/* Bigger expressive eyes */}
      <circle cx={76} cy={100} r={8} fill="#1a1a1a" />
      <circle cx={124} cy={100} r={8} fill="#1a1a1a" />
      {/* Pupil shine */}
      <circle cx={78.5} cy={98} r={2.2} fill="#ffffff" />
      <circle cx={126.5} cy={98} r={2.2} fill="#ffffff" />
      <circle cx={74.5} cy={102.5} r={1} fill="#ffffff" opacity={0.7} />
      <circle cx={122.5} cy={102.5} r={1} fill="#ffffff" opacity={0.7} />
    </g>
  );
}

function TigerBody() {
  return (
    <g>
      {/* Ears */}
      <path d="M50 36 Q58 18 74 44 Q60 44 50 36 Z" fill="#e67940" />
      <path d="M150 36 Q142 18 126 44 Q140 44 150 36 Z" fill="#e67940" />
      <path d="M58 36 Q63 28 68 40 Q62 40 58 36 Z" fill="#ffb6c1" />
      <path d="M142 36 Q137 28 132 40 Q138 40 142 36 Z" fill="#ffb6c1" />
      {/* Face */}
      <ellipse cx={100} cy={105} rx={68} ry={62} fill="url(#tiger-face)" stroke="#3a2e2e" strokeWidth={2} />
      {/* Cream muzzle */}
      <ellipse cx={100} cy={132} rx={36} ry={22} fill="#fff8e8" />
      {/* Stripes */}
      <path d="M50 70 Q56 85 50 96" stroke="#2c2c2c" strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d="M150 70 Q144 85 150 96" stroke="#2c2c2c" strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d="M76 52 Q80 62 82 70" stroke="#2c2c2c" strokeWidth={3} fill="none" strokeLinecap="round" />
      <path d="M124 52 Q120 62 118 70" stroke="#2c2c2c" strokeWidth={3} fill="none" strokeLinecap="round" />
      <path d="M100 50 L100 72" stroke="#2c2c2c" strokeWidth={3} strokeLinecap="round" />
      {/* Cheeks — warm pink against the orange */}
      <ellipse cx={62} cy={118} rx={9} ry={5} fill="#ff5f7a" opacity={0.35} />
      <ellipse cx={138} cy={118} rx={9} ry={5} fill="#ff5f7a" opacity={0.35} />
      {/* Eye whites */}
      <circle cx={76} cy={100} r={10} fill="url(#eye-shine)" />
      <circle cx={124} cy={100} r={10} fill="url(#eye-shine)" />
      {/* Yellow iris — bigger */}
      <circle cx={76} cy={100} r={6.5} fill="#f9c440" />
      <circle cx={124} cy={100} r={6.5} fill="#f9c440" />
      {/* Pupils */}
      <circle cx={77} cy={101} r={3.5} fill="#1a1a1a" />
      <circle cx={125} cy={101} r={3.5} fill="#1a1a1a" />
      {/* Pupil shine */}
      <circle cx={78.5} cy={98.5} r={1.6} fill="#ffffff" />
      <circle cx={126.5} cy={98.5} r={1.6} fill="#ffffff" />
    </g>
  );
}
