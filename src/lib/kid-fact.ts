import { get, set } from 'idb-keyval';

// 30 days. Same word + same Wikipedia extract should always rewrite the same way,
// so we can cache aggressively. Edge cache headers also keep responses warm.
const TTL = 1000 * 60 * 60 * 24 * 30;

type CacheEntry = { fact: string; at: number };

function cacheKey(title: string): string {
  return `kidfact:${title}`;
}

export async function fetchKidFact(title: string, extract: string): Promise<string | null> {
  const key = cacheKey(title);

  try {
    const cached = await get<CacheEntry>(key);
    if (cached && Date.now() - cached.at < TTL) return cached.fact;
  } catch {
    /* IndexedDB unavailable — proceed without cache */
  }

  try {
    const r = await fetch('/api/kid-fact', {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ title, extract }),
    });
    const ct = r.headers.get('content-type') ?? '';
    if (!r.ok || !ct.includes('application/json')) return null;
    const data = (await r.json()) as { kidFact?: string; error?: string };
    const fact = data.kidFact?.trim();
    if (!fact) return null;
    try {
      await set(key, { fact, at: Date.now() } satisfies CacheEntry);
    } catch {
      /* ignore cache write failures */
    }
    return fact;
  } catch {
    return null;
  }
}
