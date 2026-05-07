import type { ResolvedImage } from '../types';

type UnsplashResult = {
  results?: {
    urls?: { regular?: string; small?: string };
    user?: { name?: string; username?: string; links?: { html?: string } };
    links?: { html?: string };
  }[];
};

export async function resolveUnsplash(query: string): Promise<ResolvedImage | null> {
  try {
    const r = await fetch(`/api/unsplash?q=${encodeURIComponent(query)}`);
    if (!r.ok) return null;
    const data: UnsplashResult = await r.json();
    const hit = data.results?.[0];
    if (!hit?.urls?.regular) return null;
    return {
      url: hit.urls.regular,
      source: 'unsplash',
      attributionUrl: hit.links?.html,
      attributionText: hit.user?.name ? `Photo by ${hit.user.name} on Unsplash` : 'Photo on Unsplash',
    };
  } catch {
    return null;
  }
}
