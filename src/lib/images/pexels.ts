import type { ResolvedImage } from '../types';

type PexelsResult = {
  photos?: {
    src?: { large?: string; medium?: string };
    photographer?: string;
    url?: string;
  }[];
};

export async function resolvePexels(query: string): Promise<ResolvedImage | null> {
  try {
    const r = await fetch(`/api/pexels?q=${encodeURIComponent(query)}`);
    if (!r.ok) return null;
    const data: PexelsResult = await r.json();
    const hit = data.photos?.[0];
    const url = hit?.src?.large ?? hit?.src?.medium ?? null;
    if (!url) return null;
    return {
      url,
      source: 'pexels',
      attributionUrl: hit?.url,
      attributionText: hit?.photographer ? `Photo by ${hit.photographer} on Pexels` : 'Photo on Pexels',
    };
  } catch {
    return null;
  }
}
