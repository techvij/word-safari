import { useQuery } from '@tanstack/react-query';
import { get, set } from 'idb-keyval';
import type { Category, ResolvedImage } from '../lib/types';
import { slugify } from '../lib/slug';
import { resolveLocal } from '../lib/images/local';
import { resolveWikipedia, type WikiResult } from '../lib/images/wikipedia';
import { resolveCommons } from '../lib/images/commons';
import { resolveUnsplash } from '../lib/images/unsplash';
import { resolvePexels } from '../lib/images/pexels';

const CACHE_TTL = 1000 * 60 * 60 * 24 * 7; // 7 days

type CacheEntry = { resolved: ImageWithExtract; at: number };
type ImageWithExtract = ResolvedImage & { extract?: string };

async function readCache(key: string): Promise<ImageWithExtract | null> {
  try {
    const entry = (await get<CacheEntry>(`img:${key}`)) ?? null;
    if (!entry) return null;
    if (Date.now() - entry.at > CACHE_TTL) return null;
    return entry.resolved;
  } catch {
    return null;
  }
}

async function writeCache(key: string, resolved: ImageWithExtract) {
  try {
    await set(`img:${key}`, { resolved, at: Date.now() } satisfies CacheEntry);
  } catch {
    /* IndexedDB may be unavailable in some contexts; ignore */
  }
}

export async function resolveImage(
  category: Category,
  word: string,
  wikiOverride?: string,
): Promise<ImageWithExtract> {
  const key = `${category}/${slugify(word)}`;
  const cached = await readCache(key);
  if (cached?.url) return cached;

  // 1. Local manifest
  const local = await resolveLocal(category, word);
  if (local?.url) {
    await writeCache(key, local);
    return local;
  }

  // 2. Wikipedia
  const wiki = await resolveWikipedia(word, wikiOverride);
  if (wiki?.url) {
    const r: ImageWithExtract = wiki;
    await writeCache(key, r);
    return r;
  }
  // hold onto the extract even if no thumbnail (still useful for facts)
  const wikiExtract: WikiResult | null = wiki?.extract ? wiki : null;

  // 3. Wikimedia Commons
  const commons = await resolveCommons(word);
  if (commons?.url) {
    const merged: ImageWithExtract = { ...commons, extract: wikiExtract?.extract };
    await writeCache(key, merged);
    return merged;
  }

  // 4. Unsplash (only if proxy responds — gracefully no-op in dev without keys)
  const unsplash = await resolveUnsplash(word);
  if (unsplash?.url) {
    const merged: ImageWithExtract = { ...unsplash, extract: wikiExtract?.extract };
    await writeCache(key, merged);
    return merged;
  }

  // 5. Pexels
  const pexels = await resolvePexels(word);
  if (pexels?.url) {
    const merged: ImageWithExtract = { ...pexels, extract: wikiExtract?.extract };
    await writeCache(key, merged);
    return merged;
  }

  // 6. Emoji fallback
  return { url: null, source: 'emoji', extract: wikiExtract?.extract };
}

export function useImage(category: Category | null, word: string, wikiOverride?: string) {
  return useQuery({
    queryKey: ['image', category, word, wikiOverride],
    queryFn: () => resolveImage(category as Category, word, wikiOverride),
    enabled: !!category && !!word,
    staleTime: CACHE_TTL,
  });
}
