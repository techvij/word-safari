// Wikipedia REST + action API helpers. CORS-friendly, no key required.
// All Asia content for the game flows through these.

const WIKI_API = 'https://en.wikipedia.org/w/api.php';
const WIKI_REST = 'https://en.wikipedia.org/api/rest_v1';

export type WikiSummary = {
  title: string;
  displaytitle?: string;
  description?: string;
  extract?: string;
  thumbnail?: { source: string; width?: number; height?: number };
  originalimage?: { source: string };
  content_urls?: { desktop?: { page?: string } };
  type?: string; // "standard" | "disambiguation" | "no-extract" | ...
};

type CategoryMembersResponse = {
  query?: { categorymembers?: { title: string; ns: number }[] };
  continue?: { cmcontinue: string };
};

/** Fetch up to `limit` article (ns=0) titles from a Wikipedia category. */
export async function fetchCategoryMembers(category: string, limit = 500): Promise<string[]> {
  const params = new URLSearchParams({
    action: 'query',
    list: 'categorymembers',
    cmtitle: `Category:${category}`,
    cmlimit: String(limit),
    cmtype: 'page',
    cmnamespace: '0',
    format: 'json',
    origin: '*',
  });
  const r = await fetch(`${WIKI_API}?${params}`);
  if (!r.ok) throw new Error(`Wikipedia category fetch failed: ${r.status}`);
  const data: CategoryMembersResponse = await r.json();
  const members = data.query?.categorymembers ?? [];
  return members.map((m) => m.title);
}

/** Fetch the REST summary (extract, thumbnail, content URLs) for a title. */
export async function fetchSummary(title: string): Promise<WikiSummary | null> {
  const url = `${WIKI_REST}/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`;
  try {
    const r = await fetch(url, { headers: { accept: 'application/json' } });
    if (!r.ok) return null;
    return (await r.json()) as WikiSummary;
  } catch {
    return null;
  }
}

/** Trim a Wikipedia extract to a kid-friendly first sentence (capped length). */
export function firstSentence(extract: string | undefined, max = 240): string | null {
  if (!extract) return null;
  // Strip parenthetical asides like "(Japanese: 寿司)" that break flow for kids.
  const cleaned = extract.replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleaned) return null;
  // Match up to first sentence-ending punctuation that's followed by a space + capital letter
  // (handles abbreviations like "U.S.A.").
  const match = cleaned.match(/^.+?[.!?](?=\s+[A-Z]|\s*$)/);
  const out = (match?.[0] ?? cleaned).trim();
  return out.length > max ? out.slice(0, max - 1) + '…' : out;
}
