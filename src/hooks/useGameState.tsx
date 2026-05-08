import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from 'react';
import type { Category, Difficulty, MascotName, Phase, WordEntry } from '../lib/types';
import { bucketDifficulty, maxChancesFor } from '../lib/difficulty';
import { fetchSummary, firstSentence } from '../lib/wikipedia';
import { fetchKidFact } from '../lib/kid-fact';
import { filterByDifficulty, useWordPool } from './useWordPool';

export type FactSource = 'kid-rewrite' | 'wikipedia' | 'fallback';

const MASCOTS: MascotName[] = ['panda', 'red-panda', 'tiger'];
const RECENT_LIMIT = 5;

const CATEGORY_EMOJI: Record<Category, string> = {
  cities: '🏙️',
  fruits: '🍍',
  animals: '🐼',
  foods: '🍜',
};

export type GameState = {
  phase: Phase;
  category: Category | null;
  difficulty: Difficulty | null;
  word: string;
  emoji: string;
  fact: string;
  factSource: FactSource;
  wikiTitle?: string;
  revealed: Set<number>;
  correct: Set<string>;
  wrong: Set<string>;
  chancesLeft: number;
  maxChances: number;
  score: number;
  recent: string[];
  mascot: MascotName;
  loadError: string | null;
  // Animation flags — flip true momentarily, components reset via onAnimationComplete.
  shakeNonce: number;
  happyNonce: number;
};

type Action =
  | { type: 'select_category'; category: Category | null }
  | { type: 'select_difficulty'; difficulty: Difficulty | null }
  | { type: 'begin_loading' }
  | { type: 'load_failed'; message: string }
  | { type: 'start_round'; pick: WordEntry; mascot: MascotName; factSource: FactSource }
  | { type: 'guess'; letter: string }
  | { type: 'use_hint'; index: number }
  | { type: 'give_up' }
  | { type: 'back_to_menu' }
  | { type: 'reset_score' };

const initial: GameState = {
  phase: 'menu',
  category: null,
  difficulty: null,
  word: '',
  emoji: '',
  fact: '',
  factSource: 'fallback',
  revealed: new Set(),
  correct: new Set(),
  wrong: new Set(),
  chancesLeft: 0,
  maxChances: 0,
  score: 0,
  recent: [],
  mascot: 'panda',
  loadError: null,
  shakeNonce: 0,
  happyNonce: 0,
};

function spaceIndices(word: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < word.length; i++) if (!/[a-zA-Z]/.test(word[i])) out.push(i);
  return out;
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'select_category':
      return { ...state, category: action.category, loadError: null };
    case 'select_difficulty':
      return { ...state, difficulty: action.difficulty, loadError: null };
    case 'begin_loading':
      return { ...state, phase: 'loading', loadError: null };
    case 'load_failed':
      return { ...state, phase: 'menu', loadError: action.message };
    case 'start_round': {
      const { pick, mascot, factSource } = action;
      const max = maxChancesFor(state.difficulty ?? bucketDifficulty(pick.word));
      const revealed = new Set<number>(spaceIndices(pick.word));
      const recent = [...state.recent, pick.word].slice(-RECENT_LIMIT);
      return {
        ...state,
        phase: 'playing',
        word: pick.word,
        emoji: pick.emoji,
        fact: pick.fact,
        factSource,
        wikiTitle: pick.wiki,
        revealed,
        correct: new Set(),
        wrong: new Set(),
        chancesLeft: max,
        maxChances: max,
        recent,
        mascot,
        loadError: null,
        shakeNonce: 0,
        happyNonce: 0,
      };
    }
    case 'guess': {
      if (state.phase !== 'playing') return state;
      const letter = action.letter.toUpperCase();
      if (state.correct.has(letter) || state.wrong.has(letter)) return state;
      const upper = state.word.toUpperCase();
      if (upper.includes(letter)) {
        const revealed = new Set(state.revealed);
        for (let i = 0; i < upper.length; i++) if (upper[i] === letter) revealed.add(i);
        const correct = new Set(state.correct).add(letter);
        const won = revealed.size === state.word.length;
        return {
          ...state,
          revealed,
          correct,
          phase: won ? 'won' : state.phase,
          score: won ? state.score + 1 : state.score,
          happyNonce: state.happyNonce + 1,
        };
      }
      const wrong = new Set(state.wrong).add(letter);
      const chancesLeft = state.chancesLeft - 1;
      const lost = chancesLeft <= 0;
      return {
        ...state,
        wrong,
        chancesLeft,
        phase: lost ? 'lost' : state.phase,
        shakeNonce: state.shakeNonce + 1,
      };
    }
    case 'use_hint': {
      if (state.phase !== 'playing') return state;
      if (state.chancesLeft <= 1) return state;
      const upper = state.word.toUpperCase();
      const idx = action.index;
      if (idx < 0 || state.revealed.has(idx) || !/[A-Z]/.test(upper[idx])) return state;
      const revealed = new Set(state.revealed).add(idx);
      const letter = upper[idx];
      const correct = new Set(state.correct).add(letter);
      for (let i = 0; i < upper.length; i++) if (upper[i] === letter) revealed.add(i);
      const chancesLeft = state.chancesLeft - 1;
      const won = revealed.size === state.word.length;
      return {
        ...state,
        revealed,
        correct,
        chancesLeft,
        phase: won ? 'won' : state.phase,
        score: won ? state.score + 1 : state.score,
        happyNonce: state.happyNonce + 1,
      };
    }
    case 'give_up': {
      if (state.phase !== 'playing') return state;
      const revealed = new Set<number>();
      for (let i = 0; i < state.word.length; i++) revealed.add(i);
      return {
        ...state,
        revealed,
        phase: 'lost',
        chancesLeft: 0,
      };
    }
    case 'back_to_menu':
      return { ...state, phase: 'menu', loadError: null };
    case 'reset_score':
      return { ...state, score: 0 };
    default:
      return state;
  }
}

type Ctx = {
  state: GameState;
  selectCategory: (c: Category | null) => void;
  selectDifficulty: (d: Difficulty | null) => void;
  startRound: () => Promise<void>;
  guess: (letter: string) => void;
  useHint: () => void;
  giveUp: () => void;
  backToMenu: () => void;
  resetScore: () => void;
  letterStatus: (letter: string) => 'correct' | 'wrong' | null;
  poolStatus: 'idle' | 'loading' | 'ready' | 'error';
  poolSize: number;
};

const GameContext = createContext<Ctx | null>(null);

let lastMascot: MascotName | null = null;
function pickMascot(): MascotName {
  let next: MascotName;
  do {
    next = MASCOTS[Math.floor(Math.random() * MASCOTS.length)];
  } while (next === lastMascot && MASCOTS.length > 1);
  lastMascot = next;
  return next;
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const poolQ = useWordPool(state.category);
  const pool = poolQ.data ?? [];

  const selectCategory = useCallback((c: Category | null) => dispatch({ type: 'select_category', category: c }), []);
  const selectDifficulty = useCallback(
    (d: Difficulty | null) => dispatch({ type: 'select_difficulty', difficulty: d }),
    [],
  );

  const startRound = useCallback(async () => {
    if (!state.category || !state.difficulty) return;
    dispatch({ type: 'begin_loading' });

    try {
      // Make sure the category pool is loaded (refetches if stale).
      const titles = poolQ.data ?? (await poolQ.refetch()).data ?? [];
      if (titles.length === 0) {
        throw new Error('Wikipedia returned no candidates for this category.');
      }
      const sized = filterByDifficulty(titles, state.difficulty);
      const fresh = sized.filter((t) => !state.recent.includes(t));
      const arr = fresh.length > 0 ? fresh : sized;
      if (arr.length === 0) {
        throw new Error('No words match this difficulty. Try another one!');
      }
      const title = arr[Math.floor(Math.random() * arr.length)];
      const summary = await fetchSummary(title);
      const wikiSentence = firstSentence(summary?.extract);
      let fact: string;
      let factSource: FactSource;
      if (summary?.extract) {
        // Try the kid-friendly rewrite first; fall back to the Wikipedia
        // first sentence if the rewriter is unavailable (no API key,
        // dev with no wrangler, transient failure).
        const kid = await fetchKidFact(title, summary.extract);
        if (kid) {
          fact = kid;
          factSource = 'kid-rewrite';
        } else if (wikiSentence) {
          fact = wikiSentence;
          factSource = 'wikipedia';
        } else {
          fact = `${title} is something amazing from Asia!`;
          factSource = 'fallback';
        }
      } else {
        fact = wikiSentence ?? `${title} is something amazing from Asia!`;
        factSource = wikiSentence ? 'wikipedia' : 'fallback';
      }
      const pick: WordEntry = {
        word: title,
        category: state.category,
        emoji: CATEGORY_EMOJI[state.category],
        fact,
        wiki: summary?.title ?? title,
      };
      dispatch({ type: 'start_round', pick, mascot: pickMascot(), factSource });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not reach Wikipedia. Check your connection?';
      dispatch({ type: 'load_failed', message: msg });
    }
  }, [poolQ, state.category, state.difficulty, state.recent]);

  const guess = useCallback((letter: string) => dispatch({ type: 'guess', letter }), []);

  const useHint = useCallback(() => {
    if (state.phase !== 'playing' || state.chancesLeft <= 1) return;
    const upper = state.word.toUpperCase();
    const candidates: number[] = [];
    for (let i = 0; i < upper.length; i++) if (/[A-Z]/.test(upper[i]) && !state.revealed.has(i)) candidates.push(i);
    if (candidates.length === 0) return;
    const idx = candidates[Math.floor(Math.random() * candidates.length)];
    dispatch({ type: 'use_hint', index: idx });
  }, [state.phase, state.chancesLeft, state.word, state.revealed]);

  const giveUp = useCallback(() => dispatch({ type: 'give_up' }), []);
  const backToMenu = useCallback(() => dispatch({ type: 'back_to_menu' }), []);
  const resetScore = useCallback(() => dispatch({ type: 'reset_score' }), []);

  const letterStatus = useCallback(
    (letter: string): 'correct' | 'wrong' | null => {
      const u = letter.toUpperCase();
      if (state.correct.has(u)) return 'correct';
      if (state.wrong.has(u)) return 'wrong';
      return null;
    },
    [state.correct, state.wrong],
  );

  const poolStatus: Ctx['poolStatus'] = !state.category
    ? 'idle'
    : poolQ.isFetching
      ? 'loading'
      : poolQ.isError
        ? 'error'
        : pool.length > 0
          ? 'ready'
          : 'loading';

  const value = useMemo<Ctx>(
    () => ({
      state,
      selectCategory,
      selectDifficulty,
      startRound,
      guess,
      useHint,
      giveUp,
      backToMenu,
      resetScore,
      letterStatus,
      poolStatus,
      poolSize: pool.length,
    }),
    [
      state,
      selectCategory,
      selectDifficulty,
      startRound,
      guess,
      useHint,
      giveUp,
      backToMenu,
      resetScore,
      letterStatus,
      poolStatus,
      pool.length,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
