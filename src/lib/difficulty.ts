import type { Difficulty } from './types';

export function letterCount(word: string): number {
  return word.replace(/[^a-zA-Z]/g, '').length;
}

export function bucketDifficulty(word: string): Difficulty {
  const n = letterCount(word);
  if (n <= 5) return 'easy';
  if (n <= 8) return 'medium';
  return 'hard';
}

export function maxChancesFor(difficulty: Difficulty): number {
  return difficulty === 'easy' ? 8 : difficulty === 'medium' ? 7 : 6;
}
