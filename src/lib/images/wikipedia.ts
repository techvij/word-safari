import type { ResolvedImage, WikiSummary } from '../types';

const SUMMARY = (title: string) =>
  `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`;

export type WikiResult = ResolvedImage & { extract?: string };

export async function resolveWikipedia(word: string, override?: string): Promise<WikiResult | null> {
  const title = override ?? word;
  try {
    const r = await fetch(SUMMARY(title), { headers: { accept: 'application/json' } });
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
