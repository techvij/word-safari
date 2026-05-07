# Word Safari

A kid-friendly word-guessing game (ages 6–12), themed around Asia. Pick a category — cities, sports, animals, or foods — pick a difficulty, and guess the word one letter at a time before the panda runs out of chances.

> **No static word list.** Words, facts, and pictures are pulled live from Wikipedia + Wikimedia Commons every round.

## Stack

- **Vite + React 18 + TypeScript**
- **Tailwind CSS** — mobile-first responsive utilities, dark mode, custom palette
- **Framer Motion** — declarative state-driven animations (mascot, hearts, confetti, screen transitions)
- **TanStack Query + idb-keyval** — caches resolved images and word pools across sessions
- **Cloudflare Pages Functions** — serverless proxies for the optional API-keyed sources (Unsplash, Pexels, Anthropic)

## Live data flow

| What | Source | Notes |
| --- | --- | --- |
| Words | Wikipedia `categorymembers` API | ~1500 Asia-tagged candidates filtered down by length + a "guessable title" check (`isGuessable` in [`useWordPool.ts`](src/hooks/useWordPool.ts)) |
| Facts | Wikipedia REST summary `extract` field | First sentence is shown verbatim; if `ANTHROPIC_API_KEY` is set, the [`/api/kid-fact`](functions/api/kid-fact.ts) function rewrites it as one short kid-friendly sentence via Claude |
| Pictures | 6-source cascade with IndexedDB cache (7-day TTL) | Local override → Wikipedia → Wikimedia Commons → Unsplash → Pexels → emoji fallback. See [`useImageResolver.ts`](src/hooks/useImageResolver.ts) |
| Sounds | Synthesized in-browser via Web Audio | Zero asset bytes |

## Run locally

```sh
npm install
npm run dev          # http://localhost:5173
npm run build        # tsc -b && vite build → dist/
npm run lint         # tsc --noEmit
npm run pages:dev    # wrangler pages dev — needed to test Cloudflare Functions
```

There is no static word list to maintain. To add Asia content, edit the `ASIAN_CATEGORIES` map in [`src/hooks/useWordPool.ts`](src/hooks/useWordPool.ts) — point at any Wikipedia category whose members are guessable single-or-double-word titles.

## Deploy on Cloudflare Pages

1. Connect the repo at <https://dash.cloudflare.com> → Workers & Pages → Create → Pages.
2. Build command: `npm run build` &nbsp;·&nbsp; Build output directory: `dist`.
3. The `wrangler.toml` already pins `pages_build_output_dir = "dist"`.
4. (Optional) set environment variables — see tier table below.

### Three tiers of polish

The app works at every tier; higher tiers add nicer fact text and broader image coverage.

| Tier | Env vars to set | What you get |
| --- | --- | --- |
| **1. Free** (default) | none | Works fully. Words from Wikipedia, facts as Wikipedia first-sentence (sometimes academic tone), photos from Wikipedia + Commons + emoji |
| **2. Kid-friendly facts** | `ANTHROPIC_API_KEY` + `VITE_KID_FACT_ENABLED=true` | Adds the AI rewriter. Each round's fact is rewritten by Claude as one short sentence a 7-year-old would enjoy. ~$0.0004/round on Haiku 4.5 (set via `ANTHROPIC_KID_FACT_MODEL`) |
| **3. Full image coverage** | also set `UNSPLASH_ACCESS_KEY` and `PEXELS_API_KEY` | Cascade extends past Wikipedia/Commons to Unsplash and Pexels for words those sources don't cover |

`VITE_KID_FACT_ENABLED` is client-side and inlined at build time, so flipping it requires a redeploy. The other keys are server-side secrets evaluated per request by the Pages Functions.

For local development with Functions, copy `.env.example` → `.dev.vars` and run `npm run pages:dev`.

## Architecture notes

For deeper context on the state machine, image cascade, mascot system, and conventions, see [CLAUDE.md](CLAUDE.md).

## License

[MIT](LICENSE) © 2026 Vijeth Naravi Hegde

## Credits

- Words and facts via [Wikipedia](https://en.wikipedia.org) and [Wikimedia Commons](https://commons.wikimedia.org) under [CC BY-SA](https://creativecommons.org/licenses/by-sa/4.0/).
- Optional image sources: [Unsplash](https://unsplash.com), [Pexels](https://www.pexels.com).
- Optional fact rewriting: [Anthropic Claude API](https://www.anthropic.com).
