import { ArrowLeft } from 'lucide-react';
import { useGame } from '../../hooks/useGameState';
import { useAudio } from '../../hooks/useAudio';
import { useKeyboardInput } from '../../hooks/useKeyboardInput';
import { Mascot } from './Mascot';
import { Hearts } from './Hearts';
import { WordDisplay } from './WordDisplay';
import { AlphabetGrid } from './AlphabetGrid';
import { HintButton } from './HintButton';
import { GiveUpButton } from './GiveUpButton';
import { CategoryBadge } from './CategoryBadge';

export function GameScreen() {
  const { state, backToMenu } = useGame();
  useAudio();
  useKeyboardInput();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={backToMenu}
          className="tap-target inline-flex items-center gap-1 rounded-xl bg-white/70 px-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-white dark:bg-slate-800/80 dark:text-slate-100"
          aria-label="Back to menu"
        >
          <ArrowLeft className="h-4 w-4" /> Menu
        </button>
        <div className="font-display text-sm font-semibold text-slate-600 dark:text-slate-300">
          Score: <span className="text-bamboo-600 dark:text-bamboo-300">{state.score}</span>
        </div>
        <Hearts />
      </div>

      <CategoryBadge category={state.category} />

      <Mascot />

      <WordDisplay />

      <AlphabetGrid />

      <div className="flex flex-wrap justify-center gap-2 pt-1 sm:gap-3">
        <HintButton />
        <GiveUpButton />
      </div>
    </div>
  );
}
