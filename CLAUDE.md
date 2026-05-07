# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Word Safari** — a React + TypeScript rebuild of the kids' word-guessing game (originally vanilla HTML/CSS/JS at `../hangman/`). Theme: Asian cities, sports, animals, foods. The two repos are independent — this one does not import from the parent.

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

## Stale README warning

`README.md` still describes a static word list at `src/data/words.json` and an `images-manifest.json`. **Both files were deleted.** Words are now fetched live from Wikipedia per category (see "Dynamic content" below). Don't go looking for those files.

## Architecture: the load-bearing pieces

### Single state machine (`src/hooks/useGameState.tsx`)

All game state lives in one `useReducer`. Phases: `'menu' | 'loading' | 'playing' | 'won' | 'lost'`. The reducer is **pure** — async work (fetching word pools, summaries, kid-fact rewrites) happens in the `startRound` callback, which dispatches `begin_loading` → does the async work → dispatches `start_round` (or `load_failed` on error). Every component reads via `useGame()`. Don't add a second store; extend the reducer.

### Dynamic word pool (no static list)

`src/hooks/useWordPool.ts` declares `ASIAN_CATEGORIES` — a map from game category to a list of Wikipedia category slugs (`Capital_cities_in_Asia`, `Mammals_of_Asia`, `Japanese_cuisine`, `Korean_martial_arts`, etc.). On category select, `useWordPool` calls Wikipedia's `categorymembers` endpoint via `src/lib/wikipedia.ts`, merges + dedupes results, and runs every title through `isGuessable()` (rejects list/overview pages, parenthetical disambigs, multi-word titles >3 words, etc.). Pool is cached in TanStack Query (24h staleTime).

Per-round, `startRound` calls `fetchSummary(title)` to pull the kid-friendly extract + image. **All Wikipedia API calls are CORS-friendly and key-free** — no proxy needed.

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

**API keys are server-only.** They live in Cloudflare Pages env vars (production + preview) and `.dev.vars` for local `wrangler pages dev`. Never imported client-side. In Vite dev (`npm run dev`), the function endpoints don't exist — clients gracefully fall back: kid-fact → Wikipedia first sentence, Unsplash/Pexels → next source in cascade.

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

Client-side (prefix `VITE_`, exposed to browser):
- `VITE_WORDS_URL` — *legacy*, ignored by current code (lookup is via Wikipedia now). Listed in `.env.example` for compatibility but not read.

Server-side (Cloudflare Pages secrets, never bundled):
- `UNSPLASH_ACCESS_KEY` — for `/api/unsplash`
- `PEXELS_API_KEY` — for `/api/pexels`
- `ANTHROPIC_API_KEY` — for `/api/kid-fact` (optional; without it, fact falls back to Wikipedia first sentence)
- `ANTHROPIC_KID_FACT_MODEL` — optional override, default `claude-opus-4-7`

For local dev with Functions, copy `.env.example` → `.dev.vars` and run `npm run pages:dev`.

## Deploy

Cloudflare Pages. Connect the repo, set build = `npm run build`, output = `dist`. The `wrangler.toml` already pins `pages_build_output_dir = "dist"`. Add the server-side env vars in the Pages dashboard for both Production and Preview environments before going live.
