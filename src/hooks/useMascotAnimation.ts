import { useGame } from './useGameState';

export type MouthState = 'smile' | 'neutral' | 'frown';

export function useMascotState() {
  const { state } = useGame();
  const sadness = state.maxChances > 0 ? state.wrong.size / state.maxChances : 0;
  const mouth: MouthState = sadness < 0.34 ? 'smile' : sadness < 0.67 ? 'neutral' : 'frown';
  const tears: boolean[] = [sadness >= 0.5, sadness >= 0.75, sadness >= 0.95];
  return { sadness, mouth, tears, mascot: state.mascot, shakeNonce: state.shakeNonce, happyNonce: state.happyNonce };
}

export const MOUTH_PATHS: Record<MouthState, string> = {
  smile: 'M88 138 Q100 150 112 138',
  neutral: 'M88 140 Q100 140 112 140',
  frown: 'M88 144 Q100 130 112 144',
};
