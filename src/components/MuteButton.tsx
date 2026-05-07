import { Volume2, VolumeX } from 'lucide-react';
import { useMute } from '../hooks/useMute';
import { cn } from '../lib/utils';

export function MuteButton() {
  const { muted, toggleMute } = useMute();
  return (
    <button
      type="button"
      onClick={toggleMute}
      aria-pressed={muted}
      aria-label={muted ? 'Unmute sound' : 'Mute sound'}
      className={cn(
        'tap-target inline-flex h-11 w-11 items-center justify-center rounded-full transition',
        'bg-white shadow-sm ring-1 ring-slate-200 hover:bg-bamboo-50 hover:ring-bamboo-300 hover:text-bamboo-600 active:scale-95',
        'dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700 dark:hover:text-bamboo-300 dark:hover:ring-bamboo-700',
        muted && 'text-slate-400 dark:text-slate-500',
      )}
    >
      {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
    </button>
  );
}
