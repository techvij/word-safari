import { AnimatePresence } from 'framer-motion';
import { useGame } from './hooks/useGameState';
import { Header } from './components/Header';
import { MenuScreen } from './components/menu/MenuScreen';
import { GameScreen } from './components/game/GameScreen';
import { EndOverlay } from './components/EndOverlay';
import { Confetti } from './components/game/Confetti';
import { LoadingScreen } from './components/LoadingScreen';

export default function App() {
  const { state } = useGame();
  const screen =
    state.phase === 'menu' ? 'menu' : state.phase === 'loading' ? 'loading' : 'game';

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-bamboo-50 dark:from-slate-900 dark:to-slate-800 font-body text-slate-900 dark:text-slate-100">
      <Header />
      <main className="mx-auto w-full max-w-2xl px-4 pb-12 pt-2 sm:px-6 animate-fade-in">
        {screen === 'menu' && <MenuScreen />}
        {screen === 'loading' && <LoadingScreen />}
        {screen === 'game' && <GameScreen />}
      </main>
      <AnimatePresence>{(state.phase === 'won' || state.phase === 'lost') && <EndOverlay />}</AnimatePresence>
      {state.phase === 'won' && <Confetti />}
    </div>
  );
}
