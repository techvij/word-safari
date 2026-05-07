interface Env {
  PEXELS_API_KEY?: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const q = new URL(request.url).searchParams.get('q');
  if (!q) return json({ error: 'missing q' }, 400);
  if (!env.PEXELS_API_KEY) {
    return json({ error: 'pexels not configured', photos: [] }, 503);
  }
  try {
    const r = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=5&orientation=landscape`,
      { headers: { Authorization: env.PEXELS_API_KEY } },
    );
    if (!r.ok) return json({ error: 'upstream', status: r.status, photos: [] }, 502);
    const data = await r.json();
    return new Response(JSON.stringify(data), {
      headers: {
        'content-type': 'application/json',
        'cache-control': 'public, max-age=86400',
      },
    });
  } catch (err) {
    return json({ error: String(err), photos: [] }, 502);
  }
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
