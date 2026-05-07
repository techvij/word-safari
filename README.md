# Word Safari (React rebuild)

The next-level rebuild of [Word Safari](../) — same kid-friendly word-guessing game, now powered by React + TypeScript with a multi-source dynamic image layer.

## Stack

- **Vite + React 18 + TypeScript** — fast dev loop, no SEO need.
- **Tailwind CSS** — mobile-first responsive utilities, dark mode, design system.
- **Framer Motion** — declarative animations replacing the imperative `classList + setTimeout` pattern from the original.
- **TanStack Query + idb-keyval** — caches resolved images so repeat words are instant.
- **Cloudflare Pages Functions** — serverless proxy for Unsplash/Pexels API keys.

## Image resolution chain

`useImage()` cascades through sources, takes the first hit, and caches in IndexedDB:

1. Local manifest (`/public/images/<category>/<slug>/`)
2. Wikipedia REST summary
3. Wikimedia Commons search
4. Unsplash (`/api/unsplash` proxy)
5. Pexels (`/api/pexels` proxy)
6. Emoji fallback

## Run locally

```sh
npm install
npm run dev
```

Then open <http://localhost:5173>.

## Deploy

Set `UNSPLASH_ACCESS_KEY` and `PEXELS_API_KEY` in the Cloudflare Pages dashboard (production + preview), point the build at `npm run build`, and deploy. `pages_build_output_dir` is `dist`.

## Adding content

Append to `src/data/words.json`:

```json
{ "word": "Bao", "category": "foods", "emoji": "🥟", "fact": "...", "wiki": "Baozi" }
```

Bucket invariant: every `(category × difficulty)` should have at least one entry. Difficulty buckets: easy 3–5, medium 6–8, hard 9+ letters (non-letter chars stripped).

To add a curated photo: drop into `public/images/<category>/<slug>/`, then add the filename to `src/data/images-manifest.json`.
