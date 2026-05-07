import { useEffect } from 'react';
import { useGame } from './useGameState';

export function useKeyboardInput() {
  const { state, guess } = useGame();
  useEffect(() => {
    if (state.phase !== 'playing') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toUpperCase();
      if (k.length === 1 && /^[A-Z]$/.test(k)) {
        guess(k);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.phase, guess]);
}
