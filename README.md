# ArcadeMint

ArcadeMint is a bilingual collection of 29 original, single-player browser games. Every public page has complete English and Simplified Chinese content, localized metadata, reciprocal `hreflang`, and a static route. Games run entirely in the browser: there are no accounts, databases, business APIs, cloud saves, cookies, or browser storage for game state. Refreshing starts a new session.

## Routes

- English: `/en`, `/en/games/<slug>`, `/en/category/<category>`
- 简体中文：`/zh`、`/zh/games/<slug>`、`/zh/category/<category>`
- Collection: `/en/collections/garden-logic` and `/zh/collections/garden-logic`
- Locale switch links to the same logical page. `/` redirects permanently to `/en` without language detection.

## Game catalog

| # | Slug | English | 简体中文 |
|---:|---|---|---|
| 01 | `block-bloom` | Block Bloom | 方块绽放 |
| 02 | `number-merge-2048` | Number Merge 2048 | 数字合并 2048 |
| 03 | `neon-snake` | Neon Snake | 霓虹贪吃蛇 |
| 04 | `sky-stack` | Sky Stack | 天空叠塔 |
| 05 | `zigzag-drift` | Zigzag Drift | 折线漂移 |
| 06 | `tap-hoops` | Tap Hoops | 点击投篮 |
| 07 | `color-pour` | Color Pour | 彩色倒水 |
| 08 | `penalty-hero` | Penalty Hero | 点球英雄 |
| 09 | `slope-dash` | Slope Dash | 斜坡冲刺 |
| 10 | `helix-drop` | Helix Drop | 螺旋下落 |
| 11 | `tunnel-flux` | Tunnel Flux | 隧道流光 |
| 12 | `bubble-pop-shooter` | Bubble Pop Shooter | 泡泡消除射手 |
| 13 | `bolt-away` | Bolt Away | 螺栓拆解 |
| 14 | `unblock-path` | Unblock Path | 滑块开路 |
| 15 | `wave-rider` | Wave Rider | 波形骑手 |
| 16 | `fruit-slice-rush` | Fruit Slice Rush | 水果切切冲刺 |
| 17 | `hook-swing` | Hook Swing | 钩索飞荡 |
| 18 | `trap-runner` | Trap Runner | 陷阱跑者 |
| 19 | `rugged-wheels` | Rugged Wheels | 越野双轮 |
| 20 | `classic-solitaire` | Classic Solitaire | 经典纸牌接龙 |
| 21 | `sum-orchard` | Sum Orchard | 数字果园 |
| 22 | `color-cross` | Color Cross | 色彩十字 |
| 23 | `orbit-lines` | Orbit Lines | 轨道连线 |
| 24 | `corner-stars` | Corner Stars | 直角星阵 |
| 25 | `sidefall-blocks` | Sidefall Blocks | 侧落方块 |
| 26 | `triad-capture` | Triad Capture | 三色框选 |
| 27 | `echo-path` | Echo Path | 回声路径 |
| 28 | `target-basket` | Target Basket | 目标数字篮 |
| 29 | `math-grid-sprint` | Math Grid Sprint | 数学方格冲刺 |

## Stack and architecture

- Next.js 16.3 App Router, React 19, strict TypeScript, pnpm, and Node 24.
- Server Components render every title, guide, legal page, category, and collection.
- The game launcher imports no engine until Play is pressed. A static 29-slug loader map prevents arbitrary dynamic paths.
- DOM/CSS/SVG engines cover rule-driven games; high-frequency games use requestAnimationFrame or controlled tick loops.
- Matter.js is isolated to the lazy physics module for Hook Swing and Rugged Wheels.
- Vitest covers catalog, i18n, SEO, sitemap, and pure rules. Playwright covers all 82 public routes, both locales, all 29 game launch/reset flows, accessibility, and responsive/cross-browser behavior.

## Local development

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://localhost:3000/en` or `http://localhost:3000/zh`.

## Environment

Copy `.env.example` to `.env.local`. Required production values are:

- `NEXT_PUBLIC_SITE_URL`: the one canonical HTTPS production origin.
- `NEXT_PUBLIC_CONTACT_EMAIL`: a real public contact address.
- `NEXT_PUBLIC_LEGAL_NAME` and `NEXT_PUBLIC_GOVERNING_LAW`: operator/legal review values.
- `NEXT_PUBLIC_LAUNCH_READY`: set to `true` only after the canonical domain and all legal/contact values have been reviewed.
- Google/Bing verification values are optional.

Until `NEXT_PUBLIC_LAUNCH_READY=true`, every environment—including a Vercel Production deployment—emits `noindex,nofollow,noarchive`, a crawl-blocking robots file, and an `X-Robots-Tag` header. AdSense remains disabled unless the deployment is Production, launch-ready, `NEXT_PUBLIC_ENABLE_ADSENSE=true`, and the client/slot values are present. Google CMP is configured in AdSense Privacy & messaging, not imitated by a custom accept-only banner.

## Commands

```bash
pnpm lint                    # ESLint
pnpm typecheck               # strict TypeScript
pnpm test                    # all Vitest suites
pnpm test:i18n               # catalog/localization suite
pnpm test:seo                # metadata/sitemap suite
pnpm validate                # catalog, images, sitemap, ads settings
pnpm build                   # validation + static production build
pnpm test:e2e                # configured browser matrix
pnpm generate:images         # regenerate local cover/source/OG assets
pnpm generate:ads            # generate ads.txt from publisher env
```

For reliable local production E2E:

```bash
pnpm build
pnpm exec next start -p 3100
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 pnpm test:e2e
```

## Images

Each game owns:

```text
public/images/games/<slug>/source.png
public/images/games/<slug>/cover.webp  # 1200x675
public/images/games/<slug>/og.webp     # 1200x630
```

The generated assets are original, local, text-free, and validated for dimensions and file budget. `source.png` is never referenced by a page or Sitemap. The homepage social source was made with the built-in image generation workflow; `scripts/generate-images.ts` performs deterministic processing and game-cover generation.

## Adding game 30

1. Add the full English and Chinese definition to the master content source, including unique SEO title, description, H1, About, How to play, Tips, at least three FAQs, image alt text, and related slugs.
2. Add the slug to `src/games/loaders.ts`; never interpolate the route into an import path.
3. Implement keyboard, pointer, and touch input, pause/restart, localized HUD/status/results, cleanup, and deterministic rule tests.
4. Add presentation data and generate `source.png`, `cover.webp`, and `og.webp`.
5. Update expected counts in validation, sitemap, route, and E2E tests.
6. Run the complete build and Playwright gate before publishing.

## AdSense and ads.txt

Ads are manual content slots, never game controls. They reserve space, do not refresh automatically, and render only in Production with complete configuration. When `ADSENSE_PUBLISHER_ID=pub-...` is valid, `scripts/generate-ads-txt.mjs` writes the official Google authorization line. With ads disabled it writes only a comment, so `/ads.txt` returns 200 without claiming an authorized seller.

Before enabling ads, complete AdSense approval, Google-certified CMP setup, Privacy/Cookie URLs, and a real-device layout review. Never click live ads during testing.

## Vercel deployment

1. Import this repository as a Next.js project.
2. Use Node 24, `pnpm install --frozen-lockfile`, and `pnpm build`; do not override the output directory.
3. Set the canonical production URL and legal/contact values for Production and Preview. Keep `NEXT_PUBLIC_LAUNCH_READY=false` until they are reviewed, then set it to `true` only for Production. Preview metadata remains `noindex,nofollow,noarchive` while canonical and hreflang continue pointing to Production.
4. Bind the canonical root or `www` domain and redirect the other host.
5. Verify `/en`, `/zh`, representative game/category/collection pages, `/sitemap.xml`, `/robots.txt`, `/ads.txt`, HTTPS, and 404 behavior.

## State and rights

Game state lives only in React/engine memory. Do not add localStorage, sessionStorage, IndexedDB, game cookies, accounts, or save APIs. Familiar genre rules may be used, but names, code, levels, visual assets, audio, and written guides must remain original and must not reproduce third-party games, brands, characters, teams, or assets.
