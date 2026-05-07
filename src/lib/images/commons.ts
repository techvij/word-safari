import type { ResolvedImage } from '../types';

// Wikimedia Commons search via the public API. CORS-friendly, no key required.
// We ask for a thumbnail URL via `imageinfo` with `iiurlwidth`.
type CommonsResponse = {
  query?: {
    pages?: Record<string, {
      title: string;
      imageinfo?: { thumburl?: string; descriptionurl?: string }[];
    }>;
  };
};

const COMMONS_HEADERS: HeadersInit = {
  'Api-User-Agent': 'WordSafari/1.0 (https://github.com/techvij/word-safari; contact via GitHub)',
};

export async function resolveCommons(query: string): Promise<ResolvedImage | null> {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    generator: 'search',
    gsrsearch: `${query} filetype:bitmap`,
    gsrnamespace: '6',
    gsrlimit: '5',
    prop: 'imageinfo',
    iiprop: 'url',
    iiurlwidth: '480',
  });
  try {
    const r = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, { headers: COMMONS_HEADERS });
    if (!r.ok) return null;
    const data: CommonsResponse = await r.json();
    const pages = Object.values(data.query?.pages ?? {});
    for (const page of pages) {
      const info = page.imageinfo?.[0];
      if (info?.thumburl) {
        return {
          url: info.thumburl,
          source: 'commons',
          attributionUrl: info.descriptionurl,
          attributionText: 'Photo: Wikimedia Commons',
        };
      }
    }
    return null;
  } catch {
    return null;
  }
}
