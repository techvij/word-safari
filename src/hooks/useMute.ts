import { useEffect, useState } from 'react';

const STORAGE_KEY = 'word-safari-muted';

export function useMute() {
  const [muted, setMuted] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(STORAGE_KEY) === 'true';
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(muted));
  }, [muted]);

  return { muted, setMuted, toggleMute: () => setMuted((m) => !m) };
}
