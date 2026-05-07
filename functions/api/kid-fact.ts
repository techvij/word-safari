// Kid-friendly fact rewriter.
// Receives `{ title, extract }` (from Wikipedia REST summary), calls Claude
// to rewrite as one short kid-friendly sentence, returns `{ kidFact }`.
//
// Falls back to graceful 503 / 502 — the React client treats any non-JSON
// response as "rewriter unavailable" and uses the original Wikipedia
// first-sentence instead. So shipping without ANTHROPIC_API_KEY is fine,
// it just means kids see Wikipedia tone.

interface Env {
  ANTHROPIC_API_KEY?: string;
  // Optional override; if unset, defaults to Opus 4.7. For cost/latency-
  // sensitive operators, set to "claude-haiku-4-5" — the prompt is identical
  // and Haiku 4.5 handles this rewrite task well.
  ANTHROPIC_KID_FACT_MODEL?: string;
}

const DEFAULT_MODEL = 'claude-opus-4-7';

const SYSTEM_PROMPT = [
  'You rewrite encyclopedia entries as fun, friendly facts for kids aged 6 to 12.',
  'Output EXACTLY ONE short sentence (no more than 20 words) in simple, playful language a 7-year-old would enjoy.',
  "Use the subject's exact name once.",
  'No jargon, no scientific Latin, no parentheses, no quotation marks, no markdown, no emoji.',
  'Reply with the sentence and nothing else — no preamble, no labels, no headers.',
].join(' ');

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.ANTHROPIC_API_KEY) {
    return json({ error: 'kid-fact not configured (ANTHROPIC_API_KEY missing)' }, 503);
  }

  let body: { title?: string; extract?: string };
  try {
    body = (await request.json()) as { title?: string; extract?: string };
  } catch {
    return json({ error: 'invalid json body' }, 400);
  }

  const title = (body.title ?? '').trim();
  const extract = (body.extract ?? '').trim();
  if (!title || !extract) {
    return json({ error: 'missing title or extract' }, 400);
  }
  // Wikipedia extracts can run long; cap to keep input cost predictable.
  const trimmedExtract = extract.length > 800 ? `${extract.slice(0, 800)}…` : extract;

  const userMessage = [
    `Subject: ${title}`,
    `Wikipedia extract: ${trimmedExtract}`,
    '',
    `Write one fun fact about ${title} for a kid, in a single short sentence.`,
  ].join('\n');

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: env.ANTHROPIC_KID_FACT_MODEL ?? DEFAULT_MODEL,
        max_tokens: 150,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!r.ok) {
      const errText = await r.text();
      return json(
        { error: `anthropic ${r.status}`, detail: errText.slice(0, 200) },
        r.status === 401 || r.status === 429 ? r.status : 502,
      );
    }

    const data = (await r.json()) as {
      content?: { type: string; text?: string }[];
      stop_reason?: string;
    };
    const block = data.content?.find((b) => b.type === 'text');
    const kidFact = block?.text?.trim();
    if (!kidFact) {
      return json({ error: 'no text in response' }, 502);
    }
    return json({ kidFact }, 200, {
      // Cache identical (title, extract) pairs at the edge for 24h.
      'cache-control': 'public, max-age=86400',
    });
  } catch (err) {
    return json({ error: String(err) }, 502);
  }
};

function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...extraHeaders },
  });
}
