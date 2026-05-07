# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Word Safari** — a React + TypeScript rebuild of the kids' word-guessing game (originally vanilla HTML/CSS/JS at `../hangman/`). Theme: Asian cities, sports, animals, foods. The two repos are independent — this one does not import from the parent.

- **Repo**: <https://github.com/techvij/word-safari> (public, MIT)
- **Default branch**: `main`
- **Target host**: Cloudflare Pages (`wrangler.toml` already pins `pages_build_output_dir = "dist"`)

## Commands

```sh
npm install
npm run dev          # Vite at http://localhost:5173
npm run build        # tsc -b && vite build → dist/
npm run lint         # tsc --noEmit only — there is no ESLint config
npm run preview      # serve the production build locally
npm run pages:dev    # wrangler pages dev — needed to exercise the Cloudflare Functions
```

There is no test runner. Verification is done via the dev server + manual playthrough; `tsc --noEmit` is the static-analysis gate.

## Architecture: the load-bearing pieces

### Single state machine (`src/hooks/useGameState.tsx`)

All game state lives in one `useReducer`. Phases: `'menu' | 'loading' | 'playing' | 'won' | 'lost'`. The reducer is **pure** — async work (fetching word pools, summaries, kid-fact rewrites) happens in the `startRound` callback, which dispatches `begin_loading` → does the async work → dispatches `start_round` (or `load_failed` on error). Every component reads via `useGame()`. Don't add a second store; extend the reducer.

### Dynamic word pool (no static list)

`src/hooks/useWordPool.ts` declares `ASIAN_CATEGORIES` — a map from game category to a list of Wikipedia category slugs (`Capital_cities_in_Asia`, `Mammals_of_Asia`, `Japanese_cuisine`, `Korean_martial_arts`, etc.). On category select, `useWordPool` calls Wikipedia's `categorymembers` endpoint via `src/lib/wikipedia.ts`, merges + dedupes results, and runs every title through `isGuessable()` (rejects list/overview pages, parenthetical disambigs, multi-word titles >3 words, etc.). Pool is cached in TanStack Query (24h staleTime).

Per-round, `startRound` calls `fetchSummary(title)` to pull the extract + image. **All Wikipedia API calls are CORS-friendly and key-free** — no proxy needed. Every fetch sends an `Api-User-Agent` header per Wikipedia's User-Agent policy (browsers can't override the actual `User-Agent` from `fetch()`); the value is hardcoded in `src/lib/wikipedia.ts`, `src/lib/images/wikipedia.ts`, and `src/lib/images/commons.ts` — keep them in sync.

### Cascading image resolver (`src/hooks/useImageResolver.ts` + `src/lib/images/*.ts`)

Lazy-fetched only when the End Overlay mounts. Walks sources in order, takes the first hit, persists the winner in IndexedDB (7-day TTL via `idb-keyval`):

1. `local.ts` — `/images/<category>/<slug>/<file>` from `public/` (probed via `Image()`)
2. `wikipedia.ts` — REST summary thumbnail (no key)
3. `commons.ts` — Wikimedia Commons search (no key)
4. `unsplash.ts` — calls `/api/unsplash` (Cloudflare Function holds the key)
5. `pexels.ts` — calls `/api/pexels` (Cloudflare Function holds the key)
6. emoji fallback (always succeeds)

Each adapter returns `{ url, source, attributionUrl, attributionText }` so the UI can render proper credit.

### Cloudflare Pages Functions (`functions/api/*.ts`)

Server-side proxies for anything that needs an API key. Three endpoints today:

- `unsplash.ts` — proxies Unsplash search, injects `UNSPLASH_ACCESS_KEY`, sets `content_filter=high` (kid-safe).
- `pexels.ts` — proxies Pexels search, injects `PEXELS_API_KEY`.
- `kid-fact.ts` — receives `{ title, extract }`, calls Anthropic's `/v1/messages` with `claude-opus-4-7` (override via `ANTHROPIC_KID_FACT_MODEL`, e.g. `claude-haiku-4-5` for cost), returns `{ kidFact }` — one short kid-friendly sentence.

The kid-fact client (`src/lib/kid-fact.ts`) is **gated by the build-time env var `VITE_KID_FACT_ENABLED`**. When unset (the Tier 1 default — no Anthropic key), the client returns `null` immediately without hitting `/api/kid-fact`, so deploys without the key don't pay a 503 round-trip per round. Set `VITE_KID_FACT_ENABLED=true` AND `ANTHROPIC_API_KEY=…` together for the rewriter to actually run.

**API keys are server-only.** They live in Cloudflare Pages env vars (production + preview) and `.dev.vars` for local `wrangler pages dev`. Never imported client-side. In Vite dev (`npm run dev`), the function endpoints don't exist — clients gracefully fall back: kid-fact returns null → Wikipedia first sentence renders; Unsplash/Pexels → next source in cascade.

### Mascot system (`src/components/game/Mascot.tsx`)

Three SVG variants (`panda`, `red-panda`, `tiger`) inside one `<svg>`. **Eyes/nose/mouth/tear positions are fixed coords shared across all three** so the animations work for any mascot. The body groups define the variant-specific look (ears, fur color, cheek tone, iris color). `pickMascot()` (in `useGameState.tsx`) avoids immediate repeats via a module-level `lastMascot` cursor.

### Sadness as a normalized ratio (`src/hooks/useMascotAnimation.ts`)

`sadness = wrong.size / maxChances`. Mouth state thresholds: `<0.34` smile, `<0.67` neutral, else frown. Tears appear at `0.5 / 0.75 / 0.95`. Same proportional behavior across difficulties (8/7/6 chances).

### Sound is synthesized, never preloaded (`src/lib/audio.ts`)

Web Audio `OscillatorNode` + `GainNode` envelopes built on the fly. Zero asset bytes. `useAudio()` watches phase + correct/wrong counts and fires the right cue on each transition. The AudioContext is unlocked on first user gesture (autoplay policy).

### Animation pattern: declarative, not imperative

The original vanilla version used `classList.add() + setTimeout(remove)` patterns. **This rebuild does not.** Use:

- **Framer Motion** for state-driven animations (mascot shake/hop, hearts heartbeat/break, end-card spring, screen transitions, button presses)
- **CSS `@keyframes`** in `tailwind.config.ts` only for ambient infinite loops (`floatBob`, `heartbeat`, `confettiFall`)
- **`useReducedMotion()`** — every infinite or large motion-driven animation respects this

When adding a transient animation (shake, hop, etc.), use a **nonce counter** in state (e.g. `shakeNonce`) and `key={nonce}` on the `motion.div` so re-mounting fires a fresh animation. See `useGameState.tsx` for the pattern.

## Conventions

- **Tailwind theme** is in `tailwind.config.ts`. Custom palettes: `sky`, `bamboo` (green), `sunset` (orange), `berry` (pink). Per-category/per-difficulty theming uses these. Keep new component theming consistent.
- **Display vs body fonts**: `font-display` (Fredoka, in `index.html` Google Fonts link) for headings + buttons; `font-body` (Nunito) for prose. Set on `<body>` and inherited.
- **`cn()`** (`src/lib/utils.ts`) is the standard `clsx + tailwind-merge` helper. Use it for any conditional className.
- **Dark mode** is class-based (`darkMode: 'class'` in tailwind.config). Toggled by `ThemeToggle` component, persisted in `localStorage` under `word-safari-theme`.
- **`tap-target`** custom utility (in `globals.css`) enforces ≥44×44px hit targets. Apply to anything kids tap.

## Env vars

Client-side (prefix `VITE_`, inlined at build time and exposed to the browser):
- `VITE_KID_FACT_ENABLED` — `"true"` to activate the AI fact rewriter. Default unset → client never hits `/api/kid-fact`. Pair with `ANTHROPIC_API_KEY` below.

Server-side (Cloudflare Pages secrets, never bundled, evaluated per-request by Functions):
- `UNSPLASH_ACCESS_KEY` — for `/api/unsplash`
- `PEXELS_API_KEY` — for `/api/pexels`
- `ANTHROPIC_API_KEY` — for `/api/kid-fact` (without it, function returns 503; client gates above so it doesn't hit the function at all)
- `ANTHROPIC_KID_FACT_MODEL` — optional override, default `claude-opus-4-7`

`src/vite-env.d.ts` declares the `ImportMetaEnv` shape — extend it when adding new `VITE_*` vars so `tsc` can typecheck them.

For local dev with Functions, copy `.env.example` → `.dev.vars` and run `npm run pages:dev`. For client-side dev without Functions, plain `npm run dev` is fine and the kid-fact / Unsplash / Pexels paths gracefully no-op.

## Deploy

Cloudflare Pages. Connect the repo (<https://github.com/techvij/word-safari>), set build = `npm run build`, output = `dist`. The `wrangler.toml` already pins `pages_build_output_dir = "dist"`. Tier 1 needs no env vars; higher tiers add `ANTHROPIC_API_KEY` + `VITE_KID_FACT_ENABLED=true` for the rewriter, and optionally `UNSPLASH_ACCESS_KEY` + `PEXELS_API_KEY` for image fallbacks. See the README's tier table.

`public/favicon.svg` and `public/og-image.svg` are static assets served by Vite — emoji-based SVGs that work on any platform that supports SVG. If you need PNG variants for picky social-card scrapers (Twitter, Facebook), generate from these SVGs and update the `<meta property="og:image">` and `<link rel="icon">` paths in `index.html`.
