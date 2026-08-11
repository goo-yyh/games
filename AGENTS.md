<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# ArcadeMint immutable rules

- Keep exactly two public locales, `en` and `zh`, rooted under `src/app/[locale]`. Do not add language detection, middleware, cookie-based redirects, or unprefixed content routes.
- Do not add accounts, databases, business API routes, cloud saves, localStorage, sessionStorage, IndexedDB, or cookies for game state. Refresh must reset the current game.
- Do not import a game engine into a page, card, catalog, header, or homepage bundle. Add every new slug to the explicit lazy map in `src/games/loaders.ts` and load it only after Play.
- Matter.js may be imported only by `src/games/physics/PhysicsGames.tsx`, which serves Hook Swing and Rugged Wheels.
- Never copy third-party game code, names, levels, UI, characters, brands, sound, or images. Every public asset and guide must be owned or generated for this repository.
- When a game rule changes, update its pure engine tests and both localized public descriptions in the same change.
- Seed every procedural generator used by tests and validate that generated boards, courses, and level data remain playable.
- Color must never be the only carrier of gameplay information; pair it with symbols, patterns, labels, or position.
- Every new game requires complete independent English and Simplified Chinese SEO/copy, at least three FAQs, localized controls/HUD/results, related links, source/cover/OG images, rule tests, and both-locale E2E smoke coverage.
- After catalog or localized-content changes, run `pnpm check:content`, `pnpm validate:catalog`, and `pnpm validate:locales`.
- Page, Sitemap, canonical, breadcrumb, and related URLs must use the shared locale path helpers. Production canonical origins come only from `NEXT_PUBLIC_SITE_URL`.
- Keep Preview, Development, and any deployment without `NEXT_PUBLIC_LAUNCH_READY=true` at `noindex,nofollow,noarchive`. Do not point canonical or hreflang at a Preview host.
- Ads remain off unless Production configuration is complete. Ads must stay away from Play, Pause, Restart, result layers, virtual controls, and game touch areas; never refresh ads automatically.
- Before changing a shared engine or publishing Production, run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:i18n`, `pnpm test:seo`, `pnpm validate`, `pnpm build`, and the relevant Playwright matrix.
