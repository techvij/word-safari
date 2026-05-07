import type { ResolvedImage, WikiSummary } from '../types';

const SUMMARY = (title: string) =>
  `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`;

const WIKI_HEADERS: HeadersInit = {
  accept: 'application/json',
  'Api-User-Agent': 'WordSafari/1.0 (https://github.com/techvij/word-safari; contact via GitHub)',
};

const FETCH_TIMEOUT_MS = 8000;

export type WikiResult = ResolvedImage & { extract?: string };

export async function resolveWikipedia(word: string, override?: string): Promise<WikiResult | null> {
  const title = override ?? word;
  try {
    const r = await fetch(SUMMARY(title), {
      headers: WIKI_HEADERS,
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!r.ok) return null;
    const data: WikiSummary = await r.json();
    const url = data.thumbnail?.source ?? data.originalimage?.source ?? null;
    const articleUrl = data.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;
    return {
      url,
      source: 'wikipedia',
      attributionUrl: articleUrl,
      attributionText: 'Photo: Wikipedia',
      extract: data.extract,
    };
  } catch {
    return null;
  }
}
