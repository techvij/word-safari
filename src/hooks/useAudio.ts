import { useEffect, useRef } from 'react';
import { playCorrect, playWrong, playWin, playLose, unlockAudio } from '../lib/audio';
import { useGame } from './useGameState';
import { useMute } from './useMute';

// Watches game state and plays the appropriate cue at each transition.
// Decoupled from the reducer so the reducer stays pure.
export function useAudio() {
  const { state } = useGame();
  const { muted, toggleMute } = useMute();
  const prev = useRef<{ correct: number; wrong: number; phase: typeof state.phase }>({
    correct: state.correct.size,
    wrong: state.wrong.size,
    phase: state.phase,
  });

  useEffect(() => {
    // first user gesture unlocks the AudioContext
    const unlock = () => {
      unlockAudio();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  useEffect(() => {
    const prevState = prev.current;
    const next = { correct: state.correct.size, wrong: state.wrong.size, phase: state.phase };
    if (!muted) {
      if (next.phase === 'won' && prevState.phase !== 'won') playWin();
      else if (next.phase === 'lost' && prevState.phase !== 'lost') playLose();
      else if (next.correct > prevState.correct && next.phase === 'playing') playCorrect();
      else if (next.wrong > prevState.wrong && next.phase === 'playing') playWrong();
    }
    prev.current = next;
  }, [state.correct.size, state.wrong.size, state.phase, muted]);

  return { muted, toggleMute };
}
