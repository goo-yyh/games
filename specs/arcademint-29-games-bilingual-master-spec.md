# ArcadeMint：29 款纯前端 Web 小游戏站中英文双语完整主规格

> 用法：将本文件直接交给 Codex，从零创建、实现、测试并部署完整项目。  
> 最终范围：29 款原创单人游戏，英文与简体中文两套完整页面，双语 SEO，纯前端，无数据库，无账户，无游戏存储，刷新重新开始，部署到 Vercel。  
> 执行优先级：`Part 0 > Part III > Part II > Part I`。Part 0 统一双语架构与 SEO；Part I/II 提供 29 款游戏机制与英文内容；Part III 提供全部中文内容。  
> 不允许只交付一种语言，不允许将任何游戏标记为 Coming soon，不允许以运行时机器翻译替代本文文案。

---

# Part 0：中英文双语总纲与 SEO 规范（最高优先级）

> **执行优先级：Part 0 > Part III > Part II > Part I。**  
> Part I 与 Part II 继续负责 29 款游戏的玩法、实现、图片、测试与广告安全细节；Part 0 统一覆盖其中所有“仅英文”“不做多语言”、无语言前缀路由、单语言 Metadata、单语言 Sitemap 和单语言验收要求。  
> Part III 提供 29 款游戏的简体中文公开文案与中文 SEO。Part I/Part II 中已有的英文 SEO 与英文正文继续作为英文版本使用。  
> 本文件是一个完整交付规格，不允许 Codex 只实现英文版本，也不允许把中文页面做成客户端翻译、自动翻译或英文正文加中文导航。

---

## 0.1 最终产品范围

最终一次性上线：

- 29 款原创、单人、纯前端 Web 小游戏。
- 两种完整语言：
  - `en`：通用英文。
  - `zh`：简体中文，对应 HTML `lang="zh-CN"` 与 `hreflang="zh-CN"`。
- 58 个可索引游戏详情页：
  - 29 个英文游戏页。
  - 29 个简体中文游戏页。
- 两套完整首页、分类页、Garden Logic 集合页、About、Contact、Privacy、Cookies、Terms、Accessibility 和 404 文案。
- 中英文页面均拥有独立 URL、Title、Meta description、H1、正文、Canonical、Open Graph、Breadcrumb、结构化数据和内部链接。
- 所有页面继续保持纯前端、无数据库、无账户、无游戏进度存储；刷新后游戏重新开始。

不得把语言支持理解为：

- 同一 URL 根据浏览器语言返回不同 HTML。
- 使用 Cookie、`localStorage` 或 `Accept-Language` 隐式切换内容。
- 在同一页面并排显示完整中英文正文。
- 先渲染英文，再用客户端 JavaScript 替换成中文。
- 只翻译 Header、按钮和 Footer，而游戏说明仍为英文。
- 让搜索引擎只索引英文，中文使用 `noindex`。
- 使用机器翻译 API 在运行时生成内容。

---

## 0.2 语言与 URL 方案

采用对称子目录：

```text
/en
/zh

/en/games/<slug>
/zh/games/<slug>

/en/category/puzzle
/zh/category/puzzle

/en/category/arcade
/zh/category/arcade

/en/category/skill
/zh/category/skill

/en/category/brain
/zh/category/brain

/en/collections/garden-logic
/zh/collections/garden-logic

/en/about
/zh/about
...其余品牌与法律页面同理
```

规则：

1. 路由前缀只使用 `en` 和 `zh`，不要使用查询参数，例如 `?lang=zh`。
2. 两种语言共用同一个英文 ASCII Slug，避免维护两套 Slug 映射：
   - 正确：`/zh/games/block-bloom`
   - 不采用：`/zh/games/方块绽放`
3. Part I/Part II 中形如 `/games/block-bloom` 的旧示例均视为**逻辑路径后缀**，实际生产 URL 必须加 `/{locale}`。
4. `/` 使用固定的永久重定向到 `/en`，作为 `x-default` 默认入口。
5. 该重定向不得读取 IP、Cookie、浏览器语言或 `Accept-Language`；不得把已经访问 `/en/...` 或 `/zh/...` 的用户自动改到另一种语言。
6. Header 必须提供可见的语言切换链接，切换时保持当前逻辑路径：
   - `/en/games/color-pour` ↔ `/zh/games/color-pour`
   - `/en/category/brain` ↔ `/zh/category/brain`
7. 如果某个路径在目标语言不存在，才回退到目标语言首页；本项目首发范围内不得发生这种情况，因为所有索引页必须成对存在。
8. 切换语言会重新加载游戏页面并重新开始当前游戏，这是“无存储、刷新重置”模型下的预期行为。
9. 不保存语言偏好。用户可以直接收藏 `/en/...` 或 `/zh/...` URL。

固定根重定向示例：

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/en",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
```

---

## 0.3 Next.js 双语目录结构

不引入必须依赖 Middleware 的 i18n 方案。全部内容在构建时静态生成：

```text
src/
├─ app/
│  ├─ [locale]/
│  │  ├─ layout.tsx
│  │  ├─ page.tsx
│  │  ├─ not-found.tsx
│  │  ├─ games/
│  │  │  └─ [slug]/page.tsx
│  │  ├─ category/
│  │  │  └─ [slug]/page.tsx
│  │  ├─ collections/
│  │  │  └─ garden-logic/page.tsx
│  │  ├─ about/page.tsx
│  │  ├─ contact/page.tsx
│  │  ├─ privacy/page.tsx
│  │  ├─ cookies/page.tsx
│  │  ├─ terms/page.tsx
│  │  └─ accessibility/page.tsx
│  ├─ sitemap.ts
│  └─ robots.ts
├─ content/
│  ├─ site/
│  │  ├─ en.ts
│  │  └─ zh.ts
│  ├─ legal/
│  │  ├─ en.ts
│  │  └─ zh.ts
│  ├─ categories/
│  │  ├─ en.ts
│  │  └─ zh.ts
│  └─ games/
│     ├─ index.ts
│     ├─ block-bloom.ts
│     ├─ number-merge-2048.ts
│     └─ ...共 29 个内容文件
├─ i18n/
│  ├─ config.ts
│  ├─ paths.ts
│  ├─ dictionaries.ts
│  └─ validation.ts
└─ games/
   └─ ...29 个玩法实现目录
```

要求：

- `src/games/**` 只负责玩法与游戏内部状态，不保存 SEO 文案。
- `src/content/**` 负责可索引文案与 Metadata。
- 玩法规则、关卡、碰撞、计分算法只维护一份，不复制成 `en` 和 `zh` 两套。
- 游戏运行组件通过 `locale` 接收按钮与状态文字。
- 首页与游戏详情页的 SEO 正文必须由 Server Component 输出到初始 HTML。
- 不使用 Middleware 做语言识别，避免额外运行时和搜索引擎抓取差异。
- 不使用远程翻译服务。

---

## 0.4 Locale 配置

```ts
// src/i18n/config.ts
export const locales = ["en", "zh"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeConfig = {
  en: {
    route: "en",
    htmlLang: "en",
    hreflang: "en",
    ogLocale: "en_US",
    label: "English",
    shortLabel: "EN",
  },
  zh: {
    route: "zh",
    htmlLang: "zh-CN",
    hreflang: "zh-CN",
    ogLocale: "zh_CN",
    label: "简体中文",
    shortLabel: "中文",
  },
} as const satisfies Record<
  Locale,
  {
    route: string;
    htmlLang: string;
    hreflang: string;
    ogLocale: string;
    label: string;
    shortLabel: string;
  }
>;

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
```

`[locale]/layout.tsx`：

```tsx
import { notFound } from "next/navigation";
import { isLocale, localeConfig, locales, type Locale } from "@/i18n/config";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale: Locale = rawLocale;

  return (
    <html lang={localeConfig[locale].htmlLang} dir="ltr">
      <body>{children}</body>
    </html>
  );
}
```

要求：

- 英文 HTML 源码必须输出 `<html lang="en">`。
- 中文 HTML 源码必须输出 `<html lang="zh-CN">`。
- 不得在 hydration 后才修改 `lang`。
- 两种语言均为从左到右排版。
- 非法 Locale 返回 404，不回退成英文 200 页面。

---

## 0.5 本地化内容数据模型

```ts
export interface LocalizedFaq {
  question: string;
  answer: string;
}

export interface LocalizedSeo {
  primaryKeyword: string; // 仅用于编辑规划，不输出 meta keywords
  title: string;
  description: string;
  h1: string;
  cardCopy: string;
  imageAlt: string;
}

export interface LocalizedGameCopy {
  displayName: string;
  seo: LocalizedSeo;
  about: string[];
  howToPlay: string[];
  tips: string[];
  faq: LocalizedFaq[];
  ui?: Partial<GameUiDictionary>;
}

export interface GameDefinition {
  id: `G${string}`;
  slug: string;
  categories: GameCategory[];
  difficulty: Difficulty;
  engine: "dom" | "canvas" | "svg" | "matter";
  relatedSlugs: string[];
  image: {
    cover: string;
    og: string;
  };
  locales: Record<Locale, LocalizedGameCopy>;
}
```

内容要求：

- 29 个游戏必须全部包含 `en` 与 `zh`。
- 构建校验缺少任何语言、Title、Description、H1、About、How to play、Tips、FAQ 时失败。
- `primaryKeyword` 只用于内容策略和测试，不生成 `<meta name="keywords">`。
- 不允许以英文内容作为中文缺失字段的运行时 fallback。
- `displayName` 可本地化，但 `slug`、游戏 ID、图片与实现模块保持一致。
- 相关推荐只保存 Slug，由当前 Locale 动态解析名称和路径。
- 页面中不得硬编码 `/en` 或 `/zh`；统一使用路径工具。

路径工具：

```ts
// src/i18n/paths.ts
import type { Locale } from "./config";

export function localizedPath(locale: Locale, logicalPath = "/"): string {
  const normalized = logicalPath === "/" ? "" : logicalPath;
  return `/${locale}${normalized}`;
}

export function gamePath(locale: Locale, slug: string): string {
  return localizedPath(locale, `/games/${slug}`);
}

export function categoryPath(locale: Locale, slug: string): string {
  return localizedPath(locale, `/category/${slug}`);
}
```

---

## 0.6 静态路由生成

游戏页必须静态生成 58 个组合：

```ts
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    games.map((game) => ({
      locale,
      slug: game.slug,
    })),
  );
}
```

验收：

- `/en/games/<29 slugs>` 全部返回 200。
- `/zh/games/<29 slugs>` 全部返回 200。
- `/games/<slug>` 不作为正式内容 URL；项目尚未上线时直接不存在即可。
- 如果之前已经部署过无前缀英文 URL，则增加 308 重定向：
  - `/games/:slug` → `/en/games/:slug`
  - `/category/:slug` → `/en/category/:slug`
  - `/collections/:slug` → `/en/collections/:slug`
- 不创建运行时 API、Server Action、数据库或语言查询接口。
- 构建输出不得为 58 个游戏页创建业务 Serverless Function。

---

## 0.7 语言切换器与导航

Header 桌面导航：

| Key | English | 简体中文 |
|---|---|---|
| games | Games | 游戏 |
| puzzle | Puzzle | 益智 |
| arcade | Arcade | 街机 |
| skill | Skill | 技巧 |
| brain | Brain | 脑力 |
| about | About | 关于 |
| language | Language | 语言 |

语言切换器要求：

- 使用普通 `<a>` / Next `<Link>`，不是只有图标的按钮。
- 英文页显示 `简体中文` 链接；中文页显示 `English` 链接。
- `aria-label`：
  - English page: `Switch language to Simplified Chinese`
  - 中文页：`切换语言到英文`
- 链接到当前页面的成对 URL。
- 当前游戏正在运行时切换语言会开始一个新会话；不得试图把分数编码到 URL。
- 移动菜单中也必须可见。
- Footer 再提供一组语言链接。
- 不使用国旗代表语言。
- 不弹出强制语言选择层。
- 不自动根据 IP 或浏览器语言跳转。

全站常用 UI：

| Key | English | 简体中文 |
|---|---|---|
| play | Play | 开始游戏 |
| playNow | Play now | 立即开始 |
| loadingGame | Loading game… | 正在加载游戏… |
| restart | Restart | 重新开始 |
| newRun | New run | 新一局 |
| pause | Pause | 暂停 |
| resume | Resume | 继续 |
| score | Score | 分数 |
| time | Time | 时间 |
| level | Level | 关卡 |
| moves | Moves | 步数 |
| combo | Combo | 连击 |
| gameOver | Game over | 游戏结束 |
| youWin | You win | 挑战成功 |
| nextLevel | Next level | 下一关 |
| tryAgain | Try again | 再试一次 |
| undo | Undo | 撤销 |
| resetLevel | Reset level | 重置本关 |
| soundOn | Sound on | 开启声音 |
| soundOff | Sound off | 关闭声音 |
| howToPlay | How to play | 玩法说明 |
| tips | Tips | 游戏技巧 |
| faq | Frequently asked questions | 常见问题 |
| relatedGames | Related games | 相关游戏 |
| allGames | All games | 全部游戏 |
| browseAll | Browse all games | 浏览全部游戏 |
| searchPlaceholder | Search games | 搜索游戏 |
| noResults | No games found | 没有找到游戏 |
| freeToPlay | Free to play | 免费游玩 |
| noAccount | No account | 无需账号 |
| desktopMobile | Desktop + mobile | 电脑与手机 |
| refreshReset | Fresh start on refresh | 刷新重新开始 |

每款游戏的特殊状态文字也必须进入字典，例如 `No legal moves`、`Perfect`、`Goal`、`Shot 3 of 5`，不得把英文状态写死在 Canvas 中。

### 0.7.1 29 款游戏专用运行时 UI 字典

以下内容是最低要求。实现时使用稳定 Key 和参数化模板，不能在组件、Canvas 绘制函数、SVG 或物理引擎回调中直接写可见英文或中文。

| ID | Runtime keys | English | 简体中文 |
|---|---|---|---|
| G01 | `pieces`, `linesCleared`, `noLegalMoves` | Pieces · Lines cleared · No legal moves | 可用方块 · 已消除行列 · 没有可放置位置 |
| G02 | `targetTile`, `noMovesLeft`, `keepPlaying` | Target: 2048 · No moves left · Keep playing | 目标：2048 · 无法继续移动 · 继续挑战 |
| G03 | `length`, `speed`, `crashed` | Length · Speed · You crashed | 长度 · 速度 · 撞到了 |
| G04 | `towerHeight`, `perfect`, `missedPlatform` | Tower height · Perfect · Missed the platform | 塔高 · 完美落点 · 未落在平台上 |
| G05 | `distance`, `turnNow`, `leftRoad` | Distance · Turn now · You left the road | 距离 · 现在转向 · 已驶出道路 |
| G06 | `streak`, `nextHoop`, `missedHoop` | Streak · Next hoop · Missed the hoop | 连续命中 · 下一个篮筐 · 投篮未进 |
| G07 | `pours`, `emptyTube`, `puzzleSolved` | Pours · Empty tube · Puzzle solved | 倒水次数 · 空试管 · 排序完成 |
| G08 | `shotProgress`, `saveProgress`, `shoot`, `save`, `goal`, `saved`, `missed` | Shot {current} of 5 · Save {current} of 5 · Shoot · Save · Goal · Saved · Missed | 第 {current}/5 次射门 · 第 {current}/5 次扑救 · 射门 · 扑救 · 进球 · 扑出 · 射失 |
| G09 | `distance`, `speed`, `barrierHit` | Distance · Speed · Barrier hit | 距离 · 速度 · 撞上障碍 |
| G10 | `floor`, `safeGap`, `dangerZone`, `dangerHit` | Floor · Safe gap · Danger zone · Hit a danger platform | 层数 · 安全缺口 · 危险区域 · 碰到危险平台 |
| G11 | `distance`, `speed`, `opening`, `barrierHit` | Distance · Speed · Opening · Barrier hit | 距离 · 速度 · 缺口 · 撞上挡板 |
| G12 | `nextBubble`, `shotsUntilDrop`, `clusterCleared`, `ceilingAdvanced` | Next bubble · Shots until drop · Cluster cleared · Ceiling advanced | 下一个泡泡 · 距离下压剩余射击 · 泡泡组已消除 · 顶部已下压 |
| G13 | `holdingSlots`, `removeBolt`, `plateFreed`, `slotsFull` | Holding slots · Remove bolt · Plate freed · Holding slots are full | 暂存槽 · 拆下螺丝 · 板件已释放 · 暂存槽已满 |
| G14 | `targetBlock`, `exit`, `pathClear`, `puzzleSolved` | Target block · Exit · Path is clear · Puzzle solved | 目标滑块 · 出口 · 通道已打开 · 解谜完成 |
| G15 | `holdToRise`, `releaseToDive`, `distance`, `wallHit` | Hold to rise · Release to dive · Distance · Wall hit | 按住上升 · 松开下降 · 距离 · 撞上墙面 |
| G16 | `combo`, `misses`, `fruitSliced`, `hazardHit` | Combo · Misses {current}/3 · Fruit sliced · Hazard hit | 连击 · 漏掉 {current}/3 · 切中水果 · 碰到危险球 |
| G17 | `attach`, `release`, `checkpoint`, `fell` | Attach · Release · Checkpoint · You fell | 连接钩点 · 松开 · 检查点 · 已坠落 |
| G18 | `room`, `exitReached`, `trapTriggered`, `checkpoint` | Room {current} · Exit reached · Trap triggered · Checkpoint | 第 {current} 房间 · 已到达出口 · 触发陷阱 · 检查点 |
| G19 | `throttle`, `brakeReverse`, `balance`, `flipped` | Throttle · Brake / reverse · Balance · Vehicle flipped | 加速 · 刹车／倒车 · 平衡 · 车辆翻覆 |
| G20 | `stock`, `waste`, `foundations`, `tableau`, `noMovesLeft`, `dealAgain` | Stock · Waste · Foundations · Tableau · No moves left · Deal again | 牌库 · 废牌堆 · 基础牌堆 · 桌面牌列 · 无可用移动 · 重新发牌 |
| G21 | `targetTotal`, `selectionSum`, `timeBonus`, `newBoard` | Target total · Selection: {sum} · +{seconds}s bonus · New solvable board | 目标总和 · 当前选择：{sum} · 奖励 +{seconds} 秒 · 新的可解棋盘 |
| G22 | `tilesLeft`, `validCross`, `miss`, `shuffleCost` | Tiles left · Matching cross · No pair found · Shuffle costs {seconds}s | 剩余棋子 · 十字匹配 · 未找到配对 · 重排消耗 {seconds} 秒 |
| G23 | `selectOrb`, `productiveMove`, `reorbit`, `timePenalty` | Select an orb · Line cleared · Reorbit · -{seconds}s | 选择球体 · 连线已消除 · 重新排布 · 扣除 {seconds} 秒 |
| G24 | `starsSelected`, `validCorner`, `blockedArm`, `shuffleCost` | {count}/3 stars selected · Valid corner · Arm is blocked · Shuffle costs {seconds}s | 已选 {count}/3 颗星 · 有效直角 · 星臂被阻挡 · 重排消耗 {seconds} 秒 |
| G25 | `chooseTopBlock`, `destinationFull`, `chain`, `noClear` | Choose a top block · Column is full · Chain ×{count} · No group cleared | 选择列顶方块 · 目标列已满 · 连锁 ×{count} · 未形成消除组 |
| G26 | `liveCounts`, `balanced`, `comboBroken`, `refilling` | {a} / {b} / {c} · Balanced selection · Combo broken · Refilling board | {a}／{b}／{c} · 三类数量相等 · 连击中断 · 正在补充棋盘 |
| G27 | `pathLength`, `endpointSymbol`, `interiorSymbol`, `invalidPath`, `pathLocked` | Path length · Endpoint: {symbol} · Interior: {symbol} · Invalid path · Path locked | 路径长度 · 端点：{symbol} · 中间：{symbol} · 路径无效 · 路径已锁定 |
| G28 | `roundProgress`, `target`, `chooseTwo`, `correct`, `incorrect`, `timeUp` | Round {current} of 12 · Target · Choose two numbers · Correct · Try another pair · Time is up | 第 {current}/12 轮 · 目标数 · 选择两个数字 · 回答正确 · 换一组再试 · 时间到 |
| G29 | `addition`, `subtraction`, `multiplication`, `progress`, `correct`, `incorrect` | Addition · Subtraction · Multiplication · {correct}/25 correct · Correct · Check the calculation | 加法 · 减法 · 乘法 · 已答对 {correct}/25 · 正确 · 请检查计算 |

实现规则：

- 参数模板统一使用 `{name}` 占位并通过类型安全 formatter 传值；不得拼接出不自然的中文语序。
- `aria-label`、Live Region、Canvas 旁的等价状态文本和视觉 HUD 使用同一字典值。
- Canvas 内绘制中文前，等待本地字体可用；无法确认字体时使用系统字体栈，不下载远程字体。
- 所有 UI Key 在 `en` 与 `zh` 中必须完全对称；`validate-locales.mjs` 检测缺失 Key、多余 Key和未替换参数。
- E2E 至少对每款游戏触发一个专用状态，确认英文 URL 不出现中文模板、中文 URL 不出现未本地化英文状态。

---

## 0.8 双语 SEO 核心规则

### 0.8.1 每种语言拥有自己的 Canonical

示例：

```text
English:
URL       https://example.com/en/games/block-bloom
Canonical https://example.com/en/games/block-bloom

中文:
URL       https://example.com/zh/games/block-bloom
Canonical https://example.com/zh/games/block-bloom
```

禁止：

- 中文页 canonical 到英文页。
- 英文页 canonical 到中文页。
- 两种语言都 canonical 到无前缀路径。
- Preview URL 出现在 canonical。
- 通过客户端 JavaScript 修改 canonical。

### 0.8.2 双向 `hreflang`

每一个成对页面都必须输出完全相同的一组替代链接，包括自身：

```html
<link rel="alternate" hreflang="en"
      href="https://example.com/en/games/block-bloom" />
<link rel="alternate" hreflang="zh-CN"
      href="https://example.com/zh/games/block-bloom" />
<link rel="alternate" hreflang="x-default"
      href="https://example.com/en/games/block-bloom" />
```

要求：

- 使用绝对 HTTPS URL。
- 英文页列出英文自身、中文和 `x-default`。
- 中文页列出英文、中文自身和 `x-default`。
- `x-default` 指向对应英文默认页，不指向随机页。
- 两个方向必须互相返回。
- 路径、尾斜杠策略、www/裸域必须完全一致。
- `hreflang` 不是 canonical 的替代品，两者都要正确。

Google 官方依据：

- [Localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Managing multilingual sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)
- [Canonical best practices](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)

### 0.8.3 Metadata 生成

```ts
import type { Metadata } from "next";

export function buildLocalizedMetadata({
  locale,
  logicalPath,
  title,
  description,
  image,
  imageAlt,
}: {
  locale: Locale;
  logicalPath: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}): Metadata {
  const canonical = absoluteUrl(localizedPath(locale, logicalPath));
  const enUrl = absoluteUrl(localizedPath("en", logicalPath));
  const zhUrl = absoluteUrl(localizedPath("zh", logicalPath));
  const alternateLocale = locale === "en" ? "zh_CN" : "en_US";

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        en: enUrl,
        "zh-CN": zhUrl,
        "x-default": enUrl,
      },
    },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      siteName: siteConfig.name,
      locale: localeConfig[locale].ogLocale,
      alternateLocale: [alternateLocale],
      images: [
        {
          url: absoluteUrl(image),
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl(image)],
    },
    robots: isProduction
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        }
      : {
          index: false,
          follow: false,
          noarchive: true,
        },
  };
}
```

Metadata 验收：

- Title 与可见 H1 主题一致，但不要求逐字相同。
- 英文和中文 Title、Description 不是同一字符串。
- 29 个游戏在每个语言中均有独立 Title 和 Description。
- 不输出 `meta keywords`。
- 不把未经证实的“最佳”“第一”“数百万玩家”写进标题或描述。
- Description 与实际玩法一致。
- Preview/Development 全站 `noindex,nofollow,noarchive`。
- Production 才允许 `index,follow`。

### 0.8.4 页面语言必须可见且单一

每个页面的 Header、导航、H1、正文、FAQ、按钮和 Footer 使用同一语言：

- 英文 URL 中不得混入中文模板文案，专有中文游戏译名除外。
- 中文 URL 中不得保留整段英文说明，英文游戏品牌名可在首次出现时放在括号中。
- 不把完整中英文正文放在同一个 DOM 中再用 CSS 隐藏一份。
- 不使用 `data-nosnippet` 隐藏主要本地化内容。
- About 与 How to play 默认可见。
- FAQ 可折叠，但文本必须存在于服务端 HTML。

### 0.8.5 中文 SEO 文案原则

- 使用自然简体中文，不进行逐词机械翻译。
- 主关键词写入 Title、H1 或首段时保持自然，每处最多出现一次。
- 不堆叠“免费、在线、小游戏、无需下载”等词。
- `Primary keyword` 只用于编辑规划。
- 中文标题优先格式：
  - `中文游戏名 - 免费在线玩法词 | {{SITE_NAME}}`
- 中文 H1 优先格式：
  - `在线玩中文游戏名（English Name）`
- 正文首次出现英文品牌名后，后文可只用中文名。
- 数字、英文品牌和中文之间按正常中文排版，不批量插入多余空格。
- 使用 UTF-8。
- 页面应提供足够独特正文，不只把英文段落翻成同一模板。

### 0.8.6 内部链接

- 所有导航、分类、相关推荐、Breadcrumb、Footer 和 CTA 保持当前 Locale。
- 中文页的相关游戏名称使用中文 `displayName`。
- 英文页使用英文名称。
- 禁止中文页的卡片默认链接到英文页。
- 唯一跨语言链接是明确标注的语言切换器。
- 筛选器不改变 URL，不生成带语言查询参数的可索引页面。

### 0.8.7 Open Graph 与图片 SEO

- 游戏封面和无文字 OG 图可由中英文共用。
- 图片中不得嵌入英文标题，否则中文分享卡会出现语言错配。
- 如果后续确实要在 OG 图中加入标题，必须分别生成 `og-en.webp` 与 `og-zh.webp`。
- 当前首发建议继续使用无文字 `og.webp`，通过本地化 `og:title`、`og:description` 和图片 Alt 区分语言。
- 中文 Alt 使用自然中文描述画面；英文 Alt 使用英文。
- 源图 `source.png` 不被页面引用，不进入 Sitemap。
- 图片路径不带 Locale，避免重复存储相同视觉资源。

---

## 0.9 双语 Sitemap

Sitemap 必须包含每个可索引页面的两种语言 URL，并为每条 URL 提供相同的语言替代集合。

```ts
// src/app/sitemap.ts
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const logicalPages = [
    "/",
    "/category/puzzle",
    "/category/arcade",
    "/category/skill",
    "/category/brain",
    "/collections/garden-logic",
    "/about",
    "/contact",
    "/privacy",
    "/cookies",
    "/terms",
    "/accessibility",
    ...games.map((game) => `/games/${game.slug}`),
  ];

  return logicalPages.flatMap((logicalPath) => {
    const en = absoluteUrl(localizedPath("en", logicalPath));
    const zh = absoluteUrl(localizedPath("zh", logicalPath));

    const alternates = {
      languages: {
        en,
        "zh-CN": zh,
        "x-default": en,
      },
    };

    return [
      {
        url: en,
        lastModified: CONTENT_LAST_UPDATED,
        changeFrequency: logicalPath === "/" ? "weekly" : "monthly",
        alternates,
      },
      {
        url: zh,
        lastModified: CONTENT_LAST_UPDATED,
        changeFrequency: logicalPath === "/" ? "weekly" : "monthly",
        alternates,
      },
    ];
  });
}
```

要求：

- 58 个游戏 URL 全部出现且无重复。
- 首页、四个分类页、Garden Logic 和所有品牌/法律页均成对出现。
- `lastModified` 来自真实内容日期，不在每次构建时伪造为当前时间。
- 不添加 `/` 重定向 URL。
- 不添加筛选查询参数、预览域名、测试页、Chunk、图片源文件或 404。
- Sitemap 中的 URL 与页面 canonical 完全一致。
- 可同时使用 HTML `hreflang` 与 Sitemap alternates，但两处必须由同一 helper 生成，避免不一致。

Next.js 官方参考：

- [Internationalization](https://nextjs.org/docs/app/guides/internationalization)
- [generateStaticParams](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)
- [generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Localized sitemap](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)

---

## 0.10 结构化数据

每个语言版本使用本地化值：

- `WebPage.name`
- `WebPage.description`
- `WebPage.url`
- `WebPage.inLanguage`
- `BreadcrumbList` 的标签与 URL
- `VideoGame.name`
- `VideoGame.description`
- `VideoGame.url`
- `VideoGame.inLanguage`

示例：

```ts
const gameJsonLd = {
  "@context": "https://schema.org",
  "@type": "VideoGame",
  name: copy.displayName,
  description: copy.seo.description,
  url: canonical,
  image: absoluteUrl(game.image.og),
  inLanguage: localeConfig[locale].htmlLang,
  genre: game.categories.map((category) =>
    categoryDictionary[locale][category],
  ),
  gamePlatform: "Web browser",
  playMode: "SinglePlayer",
  isAccessibleForFree: true,
};
```

要求：

- 中文页 JSON-LD 不能复用英文 `name` 和 `description`。
- `url` 必须指向当前语言 canonical。
- Breadcrumb URL 保持当前语言。
- 不添加虚假评分、评论、用户量、下载量或互动次数。
- `VideoGame` 是诚实的语义标记，不承诺 Google 展示富结果。
- FAQ 结构化数据不是首发必需项；即使添加，也必须与页面可见问题完全一致，不承诺 FAQ 富结果。

---

## 0.11 最终首页双语 SEO 与公开文案

### English `/en`

```text
Title:
Free Online Mini Games – Play Instantly | {{SITE_NAME}}

Meta description:
Play original browser games with no download or sign-up. Enjoy puzzles, brain games, arcade challenges, sports, and skill games on desktop or mobile.

H1:
Free Browser Games. No Sign-Up. Just Play.

Eyebrow:
ORIGINAL BROWSER GAMES

Hero body:
Pick a brain puzzle, arcade challenge, sports round, or physics course and start in seconds. Every game runs in your browser on desktop or mobile.

Primary CTA:
Browse all games

Secondary CTA:
Play Block Bloom
```

English intro：

```text
ArcadeMint is a focused collection of original browser games made for quick breaks, relaxed problem solving, and score chasing. There are no downloads, accounts, profiles, or cloud saves. Choose a game, press Play, and the interactive module loads only when you are ready.

The collection includes number puzzles, geometry challenges, path games, block and color logic, one-button arcade runs, sports rounds, physics levels, and classic solitaire. Game progress stays only in the open page. Refreshing starts a new board, run, deal, or level one.
```

### 简体中文 `/zh`

```text
Title:
免费在线小游戏 - 无需下载即点即玩 | {{SITE_NAME}}

Meta description:
在线玩原创浏览器小游戏，无需下载或注册。包含益智、脑力、街机、体育和技巧游戏，电脑与手机打开即可开始。

H1:
免费在线小游戏，无需登录，打开即玩

Eyebrow:
原创浏览器小游戏

Hero body:
选择脑力谜题、街机挑战、体育回合或物理闯关，几秒内即可开始。全部游戏都能在电脑或手机浏览器中直接运行。

Primary CTA:
浏览全部游戏

Secondary CTA:
开始玩方块绽放
```

中文介绍正文：

```text
{{SITE_NAME}} 是一个专注于原创浏览器小游戏的合集，适合短暂休息、轻松解谜和反复挑战分数。网站不要求下载、注册、创建个人资料或使用云存档。选择一款游戏并点击“开始游戏”，对应的互动模块才会按需加载。

合集包含数字谜题、几何挑战、路径连接、方块与颜色逻辑、单键街机、体育回合、物理关卡和经典纸牌接龙。游戏进度只保留在当前打开的页面中；刷新后会开始新的棋盘、新的一局、新的牌局或第一关。
```

中文信任标签：

```text
免费游玩
无需账号
电脑与手机
刷新重新开始
```

首页数量：

```tsx
<h2>
  {locale === "en"
    ? `All ${games.length} games`
    : `全部 ${games.length} 款游戏`}
</h2>
```

构建时 `games.length` 必须为 29。

### Why play here / 为什么在这里玩

| English title | English body | 中文标题 | 中文正文 |
|---|---|---|---|
| Instant play | Open a game and start without registration, installation, or a long setup flow. | 打开即玩 | 无需注册、安装或经历冗长设置，打开游戏即可开始。 |
| Made for every screen | Keyboard, pointer, and touch controls are designed together instead of treating mobile as an afterthought. | 适配每块屏幕 | 键盘、鼠标与触摸操作统一设计，手机端不是事后补充。 |
| Original challenges | Every launch game uses original code, visuals, level data, and page content. | 原创挑战 | 首发游戏使用原创代码、视觉、关卡数据与页面内容。 |

中文区块标题：

```text
精心制作的轻量小游戏
```

### 首页 FAQ

English 使用 Part I/Part II 中的最终版问题。中文使用：

```text
Q: 所有游戏都可以免费玩吗？
A: 可以。{{SITE_NAME}} 上的每一款游戏都能在受支持的浏览器中免费游玩。

Q: 需要创建账号吗？
A: 不需要。首发版本没有账号、个人资料或登录流程。

Q: 会保存游戏进度吗？
A: 不会。分数、关卡、牌局、设置和撤销记录只保留在当前页面内存中，刷新后会重新开始。

Q: 手机或平板可以玩吗？
A: 可以。所有游戏都必须支持触摸和响应式布局，但部分技巧游戏使用横屏会更容易操作。

Q: 为什么网站会显示广告？
A: 广告可用于支持游戏的制作、测试与托管成本。广告必须与游戏控制区域清楚分离。

Q: 这些游戏是从其他网站复制的吗？
A: 不是。部分玩法采用常见品类规则，但代码、名称、美术、关卡数据、音效和页面文案均为原创。
```

---

## 0.12 分类页与集合页双语 SEO

### Puzzle / 益智

```text
Logical path:
/category/puzzle

English title:
Free Online Puzzle Games – Play in Your Browser | {{SITE_NAME}}

English description:
Play free browser puzzle games including blocks, numbers, sorting, bubbles, sliding pieces, bolts, and solitaire. No download or sign-up.

English H1:
Free Online Puzzle Games

中文标题:
免费在线益智游戏 - 浏览器打开即玩 | {{SITE_NAME}}

中文描述:
在线玩方块、数字、排序、泡泡、滑块、螺丝和纸牌等益智游戏，无需下载或注册，电脑与手机均可游玩。

中文 H1:
免费在线益智游戏

中文介绍:
慢下来观察棋盘，并找到更合适的下一步。这里包含方块摆放、数字合并、颜色排序、泡泡匹配、机械顺序、滑块解谜和经典纸牌接龙。所有游戏都在浏览器中直接运行，状态只保留到当前页面关闭或刷新为止。
```

### Arcade / 街机

```text
Logical path:
/category/arcade

English title:
Free Online Arcade Games – Instant Browser Play | {{SITE_NAME}}

English description:
Play quick free arcade games with one-tap, keyboard, pointer, and touch controls. Start instantly on desktop or mobile with no account.

English H1:
Free Online Arcade Games

中文标题:
免费在线街机游戏 - 无需下载立即开始 | {{SITE_NAME}}

中文描述:
在线玩单键、键盘、鼠标与触摸控制的轻量街机游戏，无需账号，电脑或手机浏览器打开即可开始。

中文 H1:
免费在线街机游戏

中文介绍:
街机游戏围绕清晰动作与即时结果展开。叠高塔楼、控制滚球、投入篮筐、切开水果、穿越隧道或挑战无尽路线。每款游戏都使用原创视觉并直接在浏览器中启动，刷新后会开始一局全新的挑战。
```

### Skill / 技巧

```text
Logical path:
/category/skill

English title:
Free Online Skill Games – Test Timing and Reflexes | {{SITE_NAME}}

English description:
Test timing, aim, balance, and reflexes in free browser skill games designed for keyboard, mouse, and touch controls.

English H1:
Free Online Skill Games

中文标题:
免费在线技巧游戏 - 挑战反应与时机 | {{SITE_NAME}}

中文描述:
通过免费的浏览器技巧游戏挑战时机、瞄准、平衡和反应速度，支持键盘、鼠标与触摸操作。

中文 H1:
免费在线技巧游戏

中文介绍:
技巧游戏奖励稳定的时机判断、预判和精细控制。合集包含驾驶、钩索、平台陷阱、隧道穿越、体育射门、切割和高速障碍路线。操作可以快速理解，难度则通过速度、布局和更紧凑的选择逐步提高。
```

### Brain / 脑力

```text
Logical path:
/category/brain

English title:
Free Brain Games Online – Logic & Math Puzzles | {{SITE_NAME}}

English description:
Play free browser brain games about numbers, patterns, geometry, paths, and quick calculation. No download, account, or saved progress required.

English H1:
Free Brain Games Online

中文标题:
免费在线脑力游戏 - 逻辑与数学谜题 | {{SITE_NAME}}

中文描述:
在线玩数字、图案、几何、路径和快速计算类脑力游戏，无需下载、账号或保存进度，刷新即可开始新挑战。

中文 H1:
免费在线脑力游戏

中文介绍:
通过原创浏览器谜题挑战数字感、空间推理、图案识别和规划能力。页面打开即可开始，刷新后会生成新的棋盘或重新回到第一关。页面不得声称游戏能够提高智商、治疗疾病或保证考试成绩。
```

### Garden Logic / 花园逻辑

```text
Logical path:
/collections/garden-logic

English title:
Free Brain Games & Logic Puzzles Online | {{SITE_NAME}}

English description:
Play nine original number, color, geometry, path, and math puzzles directly in your browser. No download, account, or saved progress required.

English H1:
Garden Logic: Free Brain Games Online

中文标题:
花园逻辑 - 免费在线脑力与逻辑游戏 | {{SITE_NAME}}

中文描述:
在线玩九款原创数字、颜色、几何、路径与数学谜题，无需下载、账号或保存进度，电脑和手机都能直接开始。

中文 H1:
花园逻辑：免费在线脑力游戏

中文介绍:
花园逻辑是一组围绕数字、颜色、几何、路径和快速计算设计的原创浏览器谜题。每款游戏都能立即打开，状态只保留在当前页面中，刷新后会开始一盘新的挑战。

中文正文:
这些游戏强调紧凑规则，而不是冗长教程。有的要求在网格中找出目标总和，有的把空白位置、直线、直角或相同端点变成谜题核心。部分游戏带有短倒计时，但所有结果都来自一轮内可以理解的明确规则。

网站不使用账号或云存档。分数、棋盘、当前模式与临时无障碍设置只存在于打开的页面中。刷新后会开始新的一局，因此这个合集更适合短暂休息，而不是长期成长系统。
```

Garden Logic 中文 FAQ：

```text
Q: 这些游戏是从 Gamesaien 复制的吗？
A: 不是。合集参考了常见益智机制，但公开名称、规则实现、计分、视觉、棋盘生成、界面、图片和页面文字均为原创。

Q: 脑力游戏会保存进度吗？
A: 不会。每款游戏只在页面打开期间保留临时状态。

Q: 可以使用触摸操作吗？
A: 可以。全部游戏支持手机和平板，并同时提供键盘操作路径。

Q: 只能通过颜色识别棋子吗？
A: 不能。依赖颜色的游戏必须同时使用符号、形状或纹理，并提供高对比度呈现。

Q: 需要下载内容吗？
A: 不需要。游戏直接运行在受支持的浏览器中。
```

---

## 0.13 品牌与法律页面双语要求

每个页面均使用 `/{locale}/...`、自引用 Canonical、双向 `hreflang` 和本地化 Breadcrumb。

### About

```text
English title:
About {{SITE_NAME}} – Original Browser Games

English description:
Learn how {{SITE_NAME}} builds original, lightweight browser games that work without downloads, accounts, or saved progress.

中文标题:
关于 {{SITE_NAME}} - 原创浏览器小游戏

中文描述:
了解 {{SITE_NAME}} 如何制作无需下载、账号或保存进度的原创轻量浏览器小游戏。

中文 H1:
关于 {{SITE_NAME}}
```

中文正文：

```text
{{SITE_NAME}} 是一个面向现代浏览器设计的原创小游戏合集。首发内容包括益智、街机、体育、平台跳跃、物理闯关、脑力谜题和经典纸牌接龙。

网站不要求创建账号、个人资料、下载应用或使用云存档。游戏状态只在当前页面打开期间存在，刷新游戏页后会开始新的一局、新的牌局或第一关。

游戏机制可能属于常见品类，但首发代码、名称、视觉资源、音效、关卡数据和文字指南均为本项目原创。如需咨询、反馈无障碍问题或提交版权通知，请联系 {{CONTACT_EMAIL}}。
```

### Contact

```text
English title:
Contact {{SITE_NAME}}

English description:
Contact {{SITE_NAME}} about general questions, accessibility, copyright notices, advertising, or business enquiries.

中文标题:
联系 {{SITE_NAME}}

中文描述:
就一般问题、无障碍反馈、版权通知、广告或商务合作联系 {{SITE_NAME}}。

中文 H1:
联系我们
```

不做后端表单；中英文页均使用 `mailto:`。中文联系方式标签：

- 一般问题
- 无障碍反馈
- 版权与知识产权通知
- 广告与商务合作
- 请勿通过邮件发送密码、支付信息或其他敏感个人信息

### Privacy、Cookies、Terms

- 英文与中文必须是两份完整、可见、可索引的正文。
- 中文版不是摘要，必须覆盖 Part I 中对应页面列出的全部条款。
- 两种语言使用同一个法律生效日期和运营主体配置。
- 不得声称“完全不收集数据”，因为 Vercel、AdSense、CMP 和安全服务可能处理技术数据。
- `{{LEGAL_ENTITY}}`、`{{CONTACT_EMAIL}}`、`{{GOVERNING_LAW}}` 等上线前必须替换。
- 正式投放广告前仍需站点所有者进行法律审查；翻译不能替代法律意见。

SEO：

| Page | English title | 中文标题 |
|---|---|---|
| Privacy | Privacy Policy \| {{SITE_NAME}} | 隐私政策 \| {{SITE_NAME}} |
| Cookies | Cookie Policy \| {{SITE_NAME}} | Cookie 政策 \| {{SITE_NAME}} |
| Terms | Terms of Use \| {{SITE_NAME}} | 使用条款 \| {{SITE_NAME}} |
| Accessibility | Accessibility \| {{SITE_NAME}} | 无障碍说明 \| {{SITE_NAME}} |

Accessibility 中文公开承诺：

```text
我们希望 {{SITE_NAME}} 在游戏形式允许的范围内，能够通过键盘、触摸、鼠标和辅助技术使用。站点导航、按钮、说明与文字内容应达到 WCAG 2.2 AA 的预期。部分高速视觉游戏对某些用户仍可能具有挑战，因此每个页面都要说明操作方式，并在可行时提供替代输入。
```

### 404

English：

```text
H1: Game over — this page is missing.
Body: The link may be outdated, or the game may have moved. Return to the full collection and start a new round.
Buttons: Browse all games / Play a random game
```

中文：

```text
H1: 游戏结束——这个页面不存在
Body: 链接可能已经过期，或页面地址发生了变化。返回完整游戏合集，开始一局新的挑战。
Buttons: 浏览全部游戏 / 随机玩一款
```

两种 404 均 `noindex`。

---

## 0.14 中文字体与排版

- 不从远程 Google Fonts CDN 加载中文字体。
- 优先使用系统字体栈，避免下载体积庞大的中文字体：
  ```css
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    "PingFang SC",
    "Hiragino Sans GB",
    "Microsoft YaHei",
    Arial,
    sans-serif;
  ```
- 中文正文默认行高不低于 `1.75`。
- 中文段落不使用全大写。
- 英文 Eyebrow 可保留字母间距；中文 Eyebrow 不使用过大的 `letter-spacing`。
- 中英文按钮都必须允许文本换行或扩展，不能依赖固定宽度。
- 游戏 HUD 为较长中文标签预留空间。
- 在 320px 宽度下检查中文 Header、筛选 Chip 和结果弹层。
- 标点使用中文全角标点，数字与单位按自然排版。
- 不为了视觉一致强行把中文标题截断成省略号；卡片允许两行标题。

---

## 0.15 AdSense 与双语页面

- 英文与简体中文都属于 Google Publisher Products 支持的语言。
- 同一个 AdSense Publisher ID 可用于两种语言页面，但广告展示仍取决于站点审核、用户地区、同意状态、库存与政策。
- CMP 消息需要同时启用英文与简体中文。
- 广告组件不根据 Locale 复制脚本；全站只加载一次 AdSense Script。
- 广告标签本地化：
  - English: `Advertisement`
  - 中文：`广告`
- 广告继续遵守 Part I/Part II 中的游戏控制区安全距离。
- 不在语言切换器旁放广告。
- 不为中文页使用与英文页不同的误导式广告布局。
- Privacy、Cookie 和 Consent 文案在当前 Locale 中显示。
- `ads.txt` 是域名级文件，不需要按语言复制。

官方参考：

- [Languages that Google publisher products support](https://support.google.com/adsense/answer/9727)
- [Privacy & messaging](https://support.google.com/adsense/answer/10924669)

---

## 0.16 双语自动化测试

新增脚本：

```json
{
  "scripts": {
    "test:i18n": "vitest run tests/i18n",
    "test:seo": "vitest run tests/seo",
    "test:e2e:locales": "playwright test tests/e2e/locales.spec.ts"
  }
}
```

### 目录完整性

测试必须验证：

- `locales` 恰好包含 `en` 与 `zh`。
- 游戏目录恰好包含 29 个唯一 Slug。
- 每款游戏同时存在 `locales.en` 与 `locales.zh`，两种语言的通用与专用 UI Key 完全对称。
- 每个语言对象包含非空 `displayName`、Title、Description、H1、Card copy、About、How、Tips 和至少 3 个 FAQ。
- 中文 Title、Description、H1 不等于英文值。
- 中文内容不得大面积回退成英文。
- 相关推荐 Slug 全部存在且不指向自身。

### 路由测试

验证：

- 58 个游戏 URL 返回 200。
- 8 个分类 URL 返回 200。
- 2 个 Garden Logic URL 返回 200。
- 2 个首页 URL 与 12 个品牌/法律 URL 均返回 200；加上分类、集合与游戏页后，首发 Sitemap 中预计共有 82 个可索引 URL。
- `/` 永久重定向到 `/en`。
- 非法 Locale 和非法 Slug 返回 404。
- 不存在客户端语言识别重定向。
- 中文 URL 不会跳到英文 URL，英文 URL也不会跳到中文 URL。

### HTML 与 SEO 测试

每一对页面验证：

- `<html lang>` 正确。
- 只有一个 H1。
- Title、Description 和 H1 已本地化。
- canonical 为当前语言自身的绝对 Production URL。
- `hreflang=en`、`hreflang=zh-CN`、`hreflang=x-default` 三项均存在。
- 两个语言页面的 alternates 集合完全一致。
- `hreflang` 目标均返回 200。
- Open Graph `url`、`locale`、`alternateLocale` 正确。
- JSON-LD `url`、`name`、`description` 与 `inLanguage` 正确。
- Breadcrumb 与相关推荐保持当前 Locale。
- Preview 环境输出 `noindex,nofollow`。
- 不存在 `meta name="keywords"`。

### Sitemap 测试

- Sitemap 中每个逻辑页面恰好有两个 URL。
- Sitemap 总条目数恰好为 82：2 个首页 + 8 个分类 + 2 个集合 + 58 个游戏 + 12 个品牌/法律页面。
- 58 个游戏 URL 全部存在。
- 每条 URL 的 alternates 同时包含英文、中文和 `x-default`。
- Sitemap URL 与对应页面 canonical 相等。
- 不包含 `/` 重定向、Preview、Query URL、404 或测试路径。
- 不存在重复 URL。

### 可见语言测试

- 中文页导航、按钮、正文、FAQ 和 Footer 为简体中文。
- 英文页导航、按钮、正文、FAQ 和 Footer 为英文。
- 中文页允许出现英文品牌名、Slug 和技术专有名词，但不得出现整段未翻译模板。
- Canvas、SVG、DOM HUD、Live Region 与结果层的通用和 29 款专用状态文本必须根据 Locale 变化，且所有参数占位均已替换。
- 语言切换后进入同一逻辑页面。
- 切换语言不会写入 Cookie、`localStorage`、`sessionStorage` 或 IndexedDB。

### 游戏回归测试

每款游戏至少在 `en` 和 `zh` 各运行一条 Smoke Test：

1. 页面加载。
2. 点击本地化 Play 按钮。
3. 游戏模块动态加载。
4. 完成一次有效操作。
5. 本地化 HUD 正确。
6. 点击本地化 Restart。
7. 刷新页面，状态恢复初始值。
8. 无控制台错误、计时器泄漏或监听器泄漏。

---

## 0.17 Vercel 部署与上线检查

Vercel 配置继续遵守 Part I/Part II，并新增：

- `NEXT_PUBLIC_SITE_URL` 必须是唯一 Production 域名。
- Production 构建输出 `/en` 与 `/zh` 全部静态路由。
- Preview URL 全站 `noindex,nofollow,noarchive`。
- Preview 中 canonical 和 hreflang 仍指向 Production 域名，不指向 `*.vercel.app`。
- `/` 在 Production 与 Preview 均固定重定向到 `/en`，但 Preview 仍禁止索引。
- 不部署 Locale Middleware。
- 不为翻译创建 Edge Function、Serverless Function 或 API Route。
- 构建日志中验证 58 个游戏静态页面。
- 部署后手工抽查：
  - `/en`
  - `/zh`
  - `/en/games/block-bloom`
  - `/zh/games/block-bloom`
  - `/en/category/brain`
  - `/zh/category/brain`
  - `/en/collections/garden-logic`
  - `/zh/collections/garden-logic`
  - `/sitemap.xml`
  - `/robots.txt`
  - `/ads.txt`
- 在 Google Search Console 只需提交统一的 Production Sitemap；Sitemap 本身包含两种语言。
- URL Inspection 分别检查至少一个英文游戏页和一个中文游戏页。
- 检查 Google 读取到自引用 canonical 与成对 `hreflang`。
- Analytics/日志按 URL 前缀区分语言，不采集游戏分数或个人游戏状态。

---

## 0.18 双语最终完成定义

只有同时满足以下条件才算交付：

- [ ] 29 款游戏全部可玩。
- [ ] 英文与中文均为完整公开语言，不是占位或自动翻译。
- [ ] 58 个游戏详情 URL 全部静态生成并返回 200。
- [ ] 29 对游戏页均有独立中英文 Title、Description、H1 和正文。
- [ ] 首页、四分类、Garden Logic、品牌页和法律页均成对存在。
- [ ] 每页 canonical 指向当前语言自身。
- [ ] 每页双向 `hreflang` 包含 `en`、`zh-CN` 和 `x-default`。
- [ ] Sitemap 覆盖所有双语 canonical URL。
- [ ] Header 和 Footer 都能切换到同一逻辑页面的另一语言。
- [ ] 不使用 IP、Cookie、浏览器语言或客户端脚本自动替换页面语言。
- [ ] 不使用数据库、账号、业务 API 或游戏存储。
- [ ] 刷新、切换语言或重新打开游戏都会开始新会话。
- [ ] 中英文 Canvas/HUD/结果层均已本地化。
- [ ] 语言与 SEO 自动化测试全部通过。
- [ ] `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm test:i18n`、`pnpm test:seo`、`pnpm test:e2e` 和 `pnpm build` 全部通过。
- [ ] Vercel Production 部署成功，Preview 不可索引。
- [ ] AdSense、CMP、Privacy 与 Cookie 文案均支持英文和简体中文。
- [ ] 生产站不存在旧的“仅英文”“20 款”“Coming soon”或未翻译占位文案。

---

# Part I：G01–G20 基础游戏机制与英文内容（阶段规格）

# G01–G20：基础游戏机制、英文内容与工程细则

> 文档用途：将本文件直接交给 Codex，要求它从零创建、实现、测试并部署一个可在 Vercel 上运行的完整网站。  
> 规格日期：2026-08-11。  
> 工作品牌名：`ArcadeMint`。品牌名、域名和联系邮箱必须集中在一个配置文件中，部署前可一次性替换。  
> 面向用户的首发语言：英文与简体中文。Part I 中的公开文案作为英文版本，中文版本见 Part III；路由与 SEO 统一遵守 Part 0。  
> 目标：Part I 先定义 G01–G20 的玩法与英文内容；最终项目按 Part 0、Part II、Part III 一次性上线 29 款游戏与中英文双语页面。
> **阶段覆盖说明：** Part I 中出现的“20 款”“3 个分类”“`/games/...`”和单语言 SEO 示例，仅描述最初 G01–G20 阶段，不能作为最终站点数量、路由或 SEO 的实现依据。最终项目固定为 29 个逻辑游戏、58 个双语游戏 URL、4 个双语分类、1 个双语集合页，并统一使用 `/{locale}/...` 路由。

---

## 0. 给 Codex 的执行指令

1. 先完整阅读本规格，再开始写代码。
2. 直接创建完整项目，不要只输出示例代码、伪代码、静态原型或未实现的 TODO。
3. G01–G20 均为最终首发范围的一部分，全部必须能开始、游玩、结束、重新开始并通过各自验收；同时还必须完成 Part II 的 G21–G29，最终不得只交付这 20 款。
4. 可以分阶段实施，但最终交付前必须完成全部阶段；不得把其中任何游戏标为“Coming soon”。
5. 除用户必须提供的域名、AdSense Publisher ID、广告位 ID、站长验证字符串和联系邮箱外，生产代码不得留下占位内容。
6. 每完成一个阶段立即运行类型检查、Lint 和相关测试；最终必须运行完整测试矩阵与生产构建。
7. 本文标记为 `CODEX_IMAGE_GEN_TASK` 的资源，调用已安装的 Image Gen skill 生成。不要从其他游戏网站下载、抓取或复制图片。
8. 若 Image Gen 输出不是 WebP，保留原始源图，并使用本地脚本转换、裁切和压缩为指定的 WebP 文件。
9. 游戏名称、角色、关卡、美术、音效、代码和页面文字均须原创。可以借鉴通用品类规则，不得复制热门游戏的品牌、角色、地图、UI、素材或关卡。
10. 最终交付必须包含：项目源码、`README.md`、`AGENTS.md`、`.env.example`、测试、生成后的本地图片、Vercel 配置说明和上线检查结果。

---

# 1. 项目目标与不可变约束

## 1.1 产品目标

建立一个以自然搜索流量和 Google AdSense 为主要商业模式的中英文双语 Web 小游戏合集站。用户打开页面即可选择游戏，在浏览器内直接游玩，不需要注册、登录、下载或安装。

Part I 负责定义 G01–G20，但最终 `/en` 与 `/zh` 首页都必须展示完整的 29 款游戏；每款游戏在两种语言下分别拥有独立、可索引、服务端预渲染的详情页。游戏代码在用户点击 **Play** 后按需加载，两种语言的 SEO 正文都无需等待 JavaScript 执行即可出现在 HTML 中。

## 1.2 强制约束

- 只做单人游戏。
- 不创建数据库。
- 不创建账户、登录、用户资料或排行榜。
- 不创建 API Route、Server Action、WebSocket 或自建后端服务。
- 游戏状态只允许存在于当前页面内存。
- 不使用 `localStorage`、`sessionStorage`、IndexedDB、Cookie 或 URL 参数保存游戏分数、关卡、设置和进度。
- 刷新页面后，当前分数、当前关卡、Undo 历史、计时、临时最佳分和游戏设置全部重置。
- 关卡型游戏允许在当前页面会话中前进到下一关，但刷新后必须回到第 1 关。
- 游戏必须同时支持桌面和移动浏览器。
- 不使用 Flash。
- 不使用真实球队、联赛、汽车品牌、影视角色或其他受保护 IP。
- 不复制任何第三方游戏的代码、素材、关卡布局、音效或营销文案。
- 不在游戏开始前强制播放广告，不实现广告自动刷新，不把广告放进 Canvas、开始按钮、暂停层或 Game Over 弹层。
- 首发必须实现英文与简体中文；仍不实现 PWA、离线缓存、社区、评论、成就系统、付费、虚拟货币或云存档。

## 1.3 首发完成定义

只有同时满足以下条件才算完成：

- `/` 返回固定永久重定向到 `/en`；`/en` 与 `/zh` 首页都返回 200 并各展示 29 张游戏卡片。
- G01–G20 在两种语言下生成 40 个本地化游戏 URL；合并 G21–G29 后，全部 58 个游戏 URL 均返回 200，并拥有独立 Metadata、自引用 Canonical、本地化正文和可玩游戏。
- Puzzle、Arcade、Skill、Brain 四个分类在两种语言下成对存在；Garden Logic、所有品牌与法律页面以及语言内 404 页面完整。
- `sitemap.xml` 输出全部双语 Canonical URL 和互惠语言替代项；`robots.txt` 与可选 `ads.txt` 正确。
- 所有游戏刷新或切换语言后重置，不产生任何游戏存储。
- 两种语言在桌面、手机和键盘路径下均可用，且游戏 HUD、按钮、状态与结果层已本地化。
- 无未处理异常、控制台错误、缺失翻译和明显内存泄漏。
- `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm test:i18n`、`pnpm test:seo`、`pnpm test:e2e`、`pnpm build` 全部通过。
- Vercel Production Deployment 成功，Preview 页面不可索引。
- Lighthouse、Core Web Vitals、双语 SEO、可访问性与广告布局达到本文门槛。
- 生产站无 `TODO`、`Lorem ipsum`、空白图片、假评分、虚假用户量、“即将上线”或未翻译占位内容。

---

# 2. 品牌、受众与文案基调

## 2.1 工作品牌

- 默认品牌：`ArcadeMint`
- 品牌标语：`Fresh games. Instant play.`
- 品牌配置只允许存在于 `src/config/site.ts`。
- 域名通过 `NEXT_PUBLIC_SITE_URL` 注入。
- 部署前如果更换品牌，只修改配置、Logo 文本和图片生成任务，不逐页手工替换。

> `ArcadeMint` 是本项目工作名，并不代表已完成商标或域名可用性核验。正式运营前由站点所有者自行完成名称、商标和域名检查。

## 2.2 目标受众

- 主要语言市场：通用英语用户与简体中文用户；不按 IP 锁定国家或地区。
- 使用场景：桌面或手机上的短时休闲、解谜和反应挑战。
- 网站定位：一般受众、家庭友好，但不把网站明确包装成面向 13 岁以下儿童的产品。
- 页面语气：简洁、友好、主动，不夸大、不使用“全球第一”“数百万玩家”等未经证实的表述。

## 2.3 公开 UI 语言

- 英文页面使用 Part I/Part II 已提供的英文文案。
- 简体中文页面使用 Part III 提供的中文文案。
- 路由、`html lang`、语言切换、字典、Canonical、`hreflang` 与 Sitemap 统一遵守 Part 0。
- 同一页面只显示一种主要语言；不得在英文页面混入中文模板，也不得在中文页面保留整段英文模板。
- 游戏品牌英文名可在中文 H1 或首次介绍中以括号保留。
- 代码注释统一使用英文，避免维护两套注释。

---

# 3. 技术方案

## 3.1 技术栈

按 2026-08-11 的稳定版本实施：

- Next.js `16.3.x`，App Router。
- React 与 Next.js 对应的稳定版本。
- Node.js `24.x`，在 `package.json#engines` 与 `.nvmrc` 中固定主版本。
- TypeScript，`strict: true`。
- Tailwind CSS 当前稳定版本。
- pnpm，并提交锁文件。
- Canvas 2D：高频动画和街机类游戏。
- React DOM / CSS Grid / SVG：低频解谜类游戏。
- Matter.js：只用于 `Hook Swing` 与 `Rugged Wheels`，且必须动态加载。
- Lucide React：通用界面图标。
- Vitest + Testing Library：单元和组件测试。
- Playwright：E2E、跨浏览器和视觉检查。
- `@axe-core/playwright`：自动可访问性检查。

禁止引入：

- Phaser、Three.js、Babylon.js 等大型全站游戏/3D 引擎。
- Redux、数据库客户端、认证 SDK、Supabase、Firebase。
- 远程图片热链、第三方字体 CDN、未经授权的音效包。
- 会把 29 个游戏全部打入首页初始 Bundle 的聚合导入方式。

初始化参考：

```bash
pnpm create next-app@latest arcademint \
  --ts --tailwind --eslint --app --src-dir \
  --import-alias "@/*"

pnpm add matter-js lucide-react clsx tailwind-merge
pnpm add -D @types/matter-js vitest @vitest/coverage-v8 jsdom \
  @testing-library/react @testing-library/jest-dom \
  @playwright/test @axe-core/playwright
```

## 3.2 渲染策略

- Layout、首页、分类页、游戏详情的标题与正文使用 Server Components。
- 只有游戏运行区、筛选器、移动导航等交互组件使用 Client Components。
- 所有公开路由必须在构建时静态预渲染。
- `/{locale}/games/[slug]` 使用 `generateStaticParams()` 从 Locale 与静态游戏目录生成页面：G01–G20 阶段为 40 个本地化页面，最终 G01–G29 为 58 个本地化页面。
- `generateMetadata()` 从同一静态目录读取 SEO 字段。
- 不调用 `cookies()`、`headers()`、数据库或运行时远程 `fetch()`。
- 不创建任何 `/api/*`。
- 游戏模块在用户点击 Play 后通过静态映射动态导入。
- 首页只加载游戏卡片，不加载任何游戏引擎。
- Matter.js 仅出现在两个物理游戏自己的异步 Chunk 中。
- 使用普通 Next.js Vercel 构建，不强制 `output: "export"`；但构建结果中所有内容路由都必须是静态输出，不得产生业务 Functions。
- 本地图片提前压缩，`next/image` 使用明确宽高；为控制 Vercel 图片优化用量，可设置 `images.unoptimized: true`。

## 3.3 推荐目录

最终目录必须遵守 Part 0 的 Locale 架构，并同时保留游戏资源、测试和部署脚本：

```text
arcademint/
├─ public/
│  ├─ images/
│  │  ├─ brand/
│  │  ├─ og/
│  │  └─ games/<slug>/{cover.webp,og.webp,source.png}
│  └─ favicon.ico
├─ scripts/
│  ├─ optimize-images.mjs
│  ├─ generate-ads-txt.mjs
│  ├─ validate-game-catalog.mjs
│  └─ validate-locales.mjs
├─ src/
│  ├─ app/
│  │  ├─ [locale]/
│  │  │  ├─ layout.tsx
│  │  │  ├─ page.tsx
│  │  │  ├─ not-found.tsx
│  │  │  ├─ games/[slug]/page.tsx
│  │  │  ├─ category/[slug]/page.tsx
│  │  │  ├─ collections/garden-logic/page.tsx
│  │  │  ├─ about/page.tsx
│  │  │  ├─ privacy/page.tsx
│  │  │  ├─ cookies/page.tsx
│  │  │  ├─ terms/page.tsx
│  │  │  ├─ contact/page.tsx
│  │  │  └─ accessibility/page.tsx
│  │  ├─ sitemap.ts
│  │  └─ robots.ts
│  ├─ components/
│  │  ├─ ads/
│  │  ├─ game/
│  │  ├─ layout/
│  │  ├─ seo/
│  │  └─ ui/
│  ├─ config/
│  │  ├─ site.ts
│  │  ├─ categories.ts
│  │  └─ ads.ts
│  ├─ content/
│  │  ├─ site/{en.ts,zh.ts}
│  │  ├─ legal/{en.ts,zh.ts}
│  │  ├─ categories/{en.ts,zh.ts}
│  │  └─ games/
│  │     ├─ index.ts
│  │     └─ ...29 个本地化游戏定义
│  ├─ i18n/{config.ts,paths.ts,dictionaries.ts,validation.ts}
│  ├─ games/
│  │  ├─ block-bloom/
│  │  ├─ number-merge-2048/
│  │  └─ ...29 个独立玩法目录
│  ├─ lib/{game-registry.ts,random.ts,seo.ts,utils.ts}
│  └─ styles/
├─ tests/
│  ├─ e2e/
│  ├─ i18n/
│  ├─ seo/
│  ├─ storage/
│  └─ visual/
├─ .env.example
├─ AGENTS.md
├─ README.md
├─ next.config.ts
├─ package.json
└─ pnpm-lock.yaml
```

不要再创建无语言前缀的 `src/app/games`、`src/app/category` 或单语言内容文件；`src/app/[locale]` 是全部公开 HTML 页面的路由根。

## 3.4 静态游戏目录与本地化校验

`src/content/games/**` 是页面、导航、Metadata、Sitemap、Breadcrumb 与相关推荐的唯一内容数据源，类型以 Part 0 §0.5 的 `GameDefinition`、`LocalizedGameCopy` 和 `LocalizedSeo` 为准。不得继续使用只有 `name`、`seoTitle`、`about` 等单语言字段的旧接口。

构建时必须验证：

- 恰好 29 个逻辑游戏与 29 个唯一 Slug。
- 每个游戏恰好拥有 `en` 和 `zh` 两份完整内容。
- 每种语言内的 SEO Title、Meta description 和 H1 均唯一；中英文值不能完全相同。
- 每款至少 3 条玩法说明、3 条技巧、3 个 FAQ；G21–G29 按其章节要求至少 4 个 FAQ。
- 每款至少 3 个有效相关推荐；相关推荐只保存 Slug，由当前 Locale 解析名称和 URL。
- 所有相关 Slug 存在且不能指向自己。
- 两种语言的图片 Alt 非空，封面和 OG 文件存在且尺寸符合要求。
- 58 个游戏页面的 Canonical、内部链接与 Sitemap URL 均由同一 `localizedPath()` / `gamePath()` helper 生成。
- 任一翻译缺失、占位符未替换、无前缀旧 URL 出现在可索引输出中时，Production Build 失败。

## 3.5 游戏加载器

建立一个显式静态映射，避免用户输入任意模块路径：

```ts
const loaders = {
  "block-bloom": () => import("@/games/block-bloom/Game"),
  "number-merge-2048": () => import("@/games/number-merge-2048/Game"),
  // ...最终全部 29 款
} satisfies Record<GameSlug, () => Promise<GameModule>>;
```

详情页首次渲染时只显示封面、简短操作提示和 **Play now**。点击后才加载实际模块并创建 Canvas/物理世界。加载失败时从当前 Locale 字典显示：

- 英文：`The game could not start.` / `Try again`。
- 中文：`游戏暂时无法启动。` / `重试`。
- 返回全部游戏的链接保持当前 Locale。

不要自动重载页面。

---

# 4. 共用游戏运行框架

## 4.1 `GameShell`

每款游戏放入统一 `GameShell`，包含：

- 游戏名称。
- 状态：Ready / Playing / Paused / Game over / Level complete。
- Play、Pause/Resume、Restart、Mute、Fullscreen。
- 当前分数、关卡或移动数；不同游戏按需显示。
- 桌面和移动操作提示。
- Canvas/DOM 游戏区域。
- 非侵入式结果弹层。
- 错误边界。
- 屏幕阅读器可读的状态更新区域。

Restart 只重置当前游戏实例；浏览器刷新必然清空整个会话。

## 4.2 状态规则

游戏状态允许存在于：

- React `useState` / `useReducer`。
- `useRef`。
- 游戏引擎对象。
- 当前页面内存中的关卡数组和 Undo 栈。

游戏状态禁止写入：

```text
localStorage
sessionStorage
IndexedDB
Cookie
Cache API
Service Worker
URL query/hash
远程 API
任何数据库
```

Cookie 只可能由 AdSense/CMP 等第三方合规组件管理，不得用于游戏状态。

## 4.3 动画与生命周期

- 高频游戏使用 `requestAnimationFrame`。
- 逻辑采用固定时间步或对 `delta` 进行上限截断，防止切回标签页后物体瞬移。
- `visibilitychange`、窗口失焦和打开系统弹层时自动暂停。
- Unmount 时取消 RAF、计时器、Pointer Capture、AudioContext 节点和所有事件监听。
- Canvas 根据容器自适应，逻辑坐标不随 DPR 改变；DPR 上限为 2。
- UI 分数更新最多约 10 次/秒，不在每一帧触发 React 整树重渲染。
- 游戏不允许在用户按 Play 前消耗持续 CPU。

## 4.4 随机数与可测试性

实现 `RandomSource`：

```ts
export interface RandomSource {
  next(): number; // [0, 1)
  int(min: number, maxInclusive: number): number;
  pick<T>(items: readonly T[]): T;
}
```

- 生产使用 `crypto.getRandomValues()` 初始化的 PRNG。
- 测试注入固定 Seed。
- 任何“随机”关卡生成器必须验证可达性或从已验证模板组合。
- 不用 `Math.random()` 散落在组件内部。

## 4.5 音效

- 不下载第三方音效。
- 使用 Web Audio API 生成短促、原创的点击、得分、碰撞和胜利提示音。
- 用户按 Play 后才能初始化音频。
- 不自动播放循环背景音乐。
- 提供 Mute 按钮；Mute 状态刷新后重置。
- 页面隐藏时暂停音频。
- 音效不是理解游戏结果的唯一方式。

## 4.6 可访问性

- 页面有 Skip link、语义 Header/Nav/Main/Footer。
- 每个游戏区域提供可读名称和简要操作说明。
- Canvas 下提供不可见但可读的状态文本。
- 所有 UI 按钮可键盘聚焦，焦点环清晰。
- 主要指针游戏尽可能提供键盘替代。
- 颜色不能是唯一信息来源；Bubble、危险区等加入形状、纹理或图标差异。
- 不使用每秒超过 3 次的全屏闪烁。
- 遵守 `prefers-reduced-motion`，减少非必要粒子、视差和卡片动画；不改变核心游戏规则。
- 移动触控目标至少约 44×44 CSS px。
- Game Over/Level Complete 打开时把焦点移到结果标题或 Restart，关闭后返回游戏区域。

---

# 5. 视觉设计系统

## 5.1 风格

定位为“现代、轻量、略带霓虹的高品质休闲游戏站”，避免廉价游戏下载站的拥挤感。

设计关键词：

- 深色底。
- 清晰、高对比的游戏封面。
- 大面积留白。
- 圆角卡片。
- 轻微霓虹边缘光。
- 简洁的文字层级。
- 不使用闪烁 Banner、滚动跑马灯或误导点击的元素。

## 5.2 设计 Token

```css
--bg: #0b1020;
--bg-elevated: #10182b;
--surface: #151f36;
--surface-hover: #1c2945;
--border: #293754;
--text: #f8fafc;
--text-muted: #aab6cc;
--primary: #7c5cff;
--primary-hover: #9279ff;
--accent: #27d3a2;
--warning: #f7c948;
--danger: #ff627d;
--focus: #8ed8ff;
```

要求：

- 正文与背景达到 WCAG AA。
- 游戏内不同状态不能只靠紫/蓝等相近颜色区分。
- 圆角：卡片 20px，按钮 12px，游戏框 24px。
- 阴影克制，Hover 仅上移 3–4px。
- 字体使用系统栈，不请求外部字体 CDN：

```css
font-family:
  Inter, ui-sans-serif, system-ui, -apple-system,
  BlinkMacSystemFont, "Segoe UI", sans-serif;
```

## 5.3 响应式

- 内容最大宽度：1200px。
- Header 高度：64px。
- 首页卡片：
  - `<640px`：1 列。
  - `640–899px`：2 列。
  - `900–1199px`：3 列。
  - `>=1200px`：4 列。
- 游戏容器最大宽度：960px。
- 常规游戏默认 16:9；棋盘/纸牌可使用更高的自适应区域。
- 手机竖屏必须可玩；适合横屏的游戏可显示“Landscape works best”，但不能阻止竖屏游玩。
- 不允许横向页面溢出。

## 5.4 游戏卡片

每张卡片包含：

- 16:9 封面。
- 类别标签。
- 游戏名称。
- 1 句独立介绍。
- 控制方式小标签，例如 `One tap`、`Keyboard + touch`。
- 链接文字 `Play now`。
- 整张卡片可点击，但内部只保留一个主要链接，避免嵌套交互。
- Hover、Focus、Active 状态一致。
- 图片宽高固定，避免 CLS。
- 不显示虚假评分、玩家人数或“热门第 1”。

---

# 6. 信息架构、导航与页面

## 6.1 路由

> 本节使用最终双语路由，不再保留无语言前缀的公开内容页。游戏 Slug 继续使用 ASCII，并在中英文间共享。

```text
/                              # 固定 308 到 /en
/en
/zh
/{locale}/games/block-bloom
/{locale}/games/number-merge-2048
...G01–G20 在本 Part 定义；最终扩展到 G01–G29
/{locale}/category/puzzle
/{locale}/category/arcade
/{locale}/category/skill
/{locale}/category/brain
/{locale}/collections/garden-logic
/{locale}/about
/{locale}/privacy
/{locale}/cookies
/{locale}/terms
/{locale}/contact
/{locale}/accessibility
/sitemap.xml
/robots.txt
/ads.txt                       # 设置 Publisher ID 后生成
```

不要创建与首页重复的 `/games` 聚合页。Header 的 `All Games` / `全部游戏` 分别指向 `/{locale}#games`。Part I 中后续出现的 `/games/{slug}` 均只是逻辑路径后缀，生产链接必须由 Locale 路由工具生成。

## 6.2 Header

桌面导航由当前 Locale 字典渲染并保持当前语言：

1. 左侧：品牌图标 + `ArcadeMint`，链接到 `/{locale}`。
2. `All Games` / `全部游戏` → `/{locale}#games`
3. `Puzzle` / `益智` → `/{locale}/category/puzzle`
4. `Arcade` / `街机` → `/{locale}/category/arcade`
5. `Skill` / `技巧` → `/{locale}/category/skill`
6. `Brain` / `脑力` → `/{locale}/category/brain`
7. `About` / `关于` → `/{locale}/about`
8. 右侧：`Random game` / `随机游戏`，从静态目录中随机跳转到当前 Locale 的游戏 URL；随机结果不保存。
9. 可见语言切换器：`English` ↔ `简体中文`，保持当前逻辑路径并使用普通 `<a>` / Next `<Link>`。

移动端：

- Logo 与当前语言可访问名称。
- Hamburger 的 `aria-label` 本地化。
- 打开后显示同一组本地化链接与语言切换器。
- Escape、点击遮罩或选择链接后关闭。
- 打开菜单时锁定背景滚动并正确管理焦点。

## 6.3 Footer

Footer 由当前 Locale 字典渲染，所有内部链接保持当前语言：

- `Games` / `游戏`：全部游戏、Puzzle/益智、Arcade/街机、Skill/技巧、Brain/脑力、Garden Logic/花园逻辑。
- `Company` / `站点`：About/关于、Contact/联系、Accessibility/无障碍。
- `Legal` / `法律`：Privacy/隐私、Cookie Policy/Cookie 政策、Terms/条款。
- 品牌说明：英文使用 `Fresh games. Instant play.`；中文使用 Part 0 规定的自然中文标语。

底部版权句按 Locale 输出，不把两种语言并排显示：

```text
English: © {{YEAR}} {{SITE_NAME}}. Original browser games. All rights reserved.
中文: © {{YEAR}} {{SITE_NAME}}。原创浏览器小游戏，保留所有权利。
```

不得在 Footer 写“点击广告支持我们”或任何诱导广告点击的文案。

---

# 7. 英文首页内容源与共享页面设计（最终双语要求见 Part 0）

## 7.1 首页 SEO

```text
Title:
Free Online Mini Games – Play Instantly | {{SITE_NAME}}

Meta description:
Play 20 free browser games with no download or sign-up. Enjoy puzzles, arcade challenges, sports games, and skill games on desktop or mobile.

Canonical:
{{SITE_URL}}/

H1:
20 Free Browser Games. No Sign-Up. Just Play.
```

Open Graph：

- `og:type = website`
- `og:title` 与 SEO Title 对齐。
- `og:description` 使用首页描述。
- `og:image = /images/og/home.webp`
- `twitter:card = summary_large_image`

## 7.2 首页 Hero 公开文案

Eyebrow：

```text
20 ORIGINAL BROWSER GAMES
```

H1：

```text
20 Free Browser Games. No Sign-Up. Just Play.
```

正文：

```text
Pick a puzzle, reflex challenge, sports round, or physics course and start in seconds. Every game runs in your browser on desktop or mobile.
```

主按钮：

```text
Browse all games
```

指向 `#games`。

次按钮：

```text
Play Block Bloom
```

指向 `/games/block-bloom`。

信任标签：

```text
Free to play
No account
Desktop + mobile
Fresh start on refresh
```

## 7.3 首页介绍正文

直接使用以下英文内容：

```text
ArcadeMint is a focused collection of original browser games made for quick breaks and relaxed score chasing. There are no downloads, accounts, profiles, or cloud saves. Choose a game, press Play, and the interactive module loads only when you are ready.

The collection mixes number and block puzzles, one-button arcade challenges, sports rounds, reaction games, platform courses, physics levels, and classic solitaire. Game progress stays only in the open page. Refreshing starts a new run, a new deal, or level one, depending on the game.
```

## 7.4 首页区块顺序

1. Header。
2. Hero。
3. Featured：展示 Block Bloom、Slope Dash、Bubble Pop Shooter、Classic Solitaire。
4. 首页广告位 `home-inline-1`，没有 AdSense 配置时完全隐藏。
5. 英文为 `All 29 games`，中文使用 Part 0 的等义文案；区块 ID 为 `games`，数量从目录计算。
6. 客户端筛选：
   - 搜索框占位：`Search games`
   - Chips：英文为 `All`、`Puzzle`、`Arcade`、`Skill`、`Brain`；中文使用对应翻译。
   - 搜索只过滤当前 DOM，不改变 URL，不创建可索引搜索页。
7. 完整 29 卡片网格；中英文首页使用相同排序，但名称、摘要、分类标签与链接本地化。
8. `Why play here?`
9. Puzzle、Arcade、Skill、Brain 四个分类入口，并在适当位置展示 Garden Logic 集合入口。
10. 首页广告位 `home-inline-2`。
11. FAQ。
12. Footer。

## 7.5 Why play here

标题：

```text
Quick games, carefully built
```

三项：

```text
Instant play
Open a game and start without registration, installation, or a long setup flow.

Made for every screen
Keyboard, pointer, and touch controls are designed together instead of treating mobile as an afterthought.

Original challenges
Every launch game uses original code, visuals, level data, and page content.
```

## 7.6 首页 FAQ

```text
Q: Are all games free to play?
A: Yes. Every game on ArcadeMint can be played free in a supported web browser.

Q: Do I need to create an account?
A: No. The launch version has no accounts, profiles, or sign-in flow.

Q: Is my progress saved?
A: No. Scores, levels, deals, settings, and undo history stay only in the current page memory. Refreshing starts over.

Q: Can I play on a phone or tablet?
A: Yes. Every game must support touch controls and responsive layouts, although some skill games are easier in landscape.

Q: Why does the site show advertisements?
A: Advertising may be used to support the cost of creating, testing, and hosting the games. Ads must remain clearly separated from gameplay controls.

Q: Are these games copied from other websites?
A: No. The games may use familiar genre rules, but the code, names, art, level data, sound effects, and page content are original.
```

## 7.7 首页封面生成

```text
CODEX_IMAGE_GEN_TASK
Output source: public/images/og/home-source.png
Final output: public/images/og/home.webp
Final dimensions: 1200×630
Prompt:
An original premium browser arcade collection hero image showing a balanced collage of abstract block puzzle pieces, a glowing rolling ball track, colorful bubbles, a playing-card tableau, a small grappling explorer and a basketball hoop, unified dark navy background with violet and mint lighting, clean spacious composition, no text, no logos, no famous characters, no watermark.
Post-process:
Crop to 1200×630, convert to WebP quality 82, verify file under 180 KB if visual quality remains acceptable.
```

---

# 8. G01–G20 英文分类内容源（最终双语分类见 Part 0）

分类由同一游戏目录生成。一个游戏可以属于多个分类，因此分类页不是互斥集合。

## 8.1 Puzzle

```text
Route: /category/puzzle
Title: Free Online Puzzle Games – Play in Your Browser | {{SITE_NAME}}
Description: Play free browser puzzle games including blocks, numbers, sorting, bubbles, sliding pieces, bolts, and solitaire. No download or sign-up.
H1: Free Online Puzzle Games
Intro:
Take your time, study the board, and find the cleanest next move. ArcadeMint puzzle games cover block placement, number merging, color sorting, bubble matching, mechanical order puzzles, sliding blocks, and Klondike solitaire. Every title runs directly in the browser and keeps its state only while the page is open.
```

## 8.2 Arcade

```text
Route: /category/arcade
Title: Free Online Arcade Games – Instant Browser Play | {{SITE_NAME}}
Description: Play quick free arcade games with one-tap, keyboard, pointer, and touch controls. Start instantly on desktop or mobile with no account.
H1: Free Online Arcade Games
Intro:
Arcade games are built around a clear action and an immediate result. Stack a tower, steer a rolling ball, score a basket, slice fruit, cross a tunnel, or survive an endless course. Each ArcadeMint game starts in the browser, uses original visuals, and resets to a fresh run when the page is refreshed.
```

## 8.3 Skill

```text
Route: /category/skill
Title: Free Online Skill Games – Test Timing and Reflexes | {{SITE_NAME}}
Description: Test timing, aim, balance, and reflexes in free browser skill games designed for keyboard, mouse, and touch controls.
H1: Free Online Skill Games
Intro:
Skill games reward timing, prediction, and controlled movement. The collection includes precision driving, grappling, platform traps, tunnel navigation, sports shots, slicing, and fast obstacle courses. Controls are simple enough to understand quickly, while difficulty grows through speed, layout, and tighter decisions.
```

分类页要求：

- 显示完整 Breadcrumb。
- 只有一个 H1。
- 显示该分类全部游戏卡片。
- 展示独立介绍，不复制首页段落。
- 分类页卡片链接到 Canonical 游戏 URL。
- 每个分类页在中部最多放一个广告位 `category-inline`。
- 不创建空分类或只有自动生成关键词列表的页面。

---

# 9. 游戏详情页共用结构

每个 `/games/[slug]` 按以下顺序渲染：

1. Breadcrumb：`Home / {Primary category} / {Game name}`。
2. H1。
3. 独立的一句话摘要。
4. 标签：类别、难度、控制方式、`No sign-up`。
5. 游戏封面与 Play 按钮。
6. 点击后替换为 `GameShell`；不要让页面整体跳动。
7. 游戏下方提示：
   ```text
   Game progress is not saved. Refreshing this page starts over.
   ```
8. `About {Game name}`：使用本文给出的独立正文。
9. `How to play`。
10. `Tips`。
11. 广告位 `game-content`。
12. FAQ。
13. `More games like this`：4 张静态相关推荐卡片。
14. 底部广告位 `game-bottom`。
15. Footer。

## 9.1 广告安全距离

- 不在游戏上方紧邻 Play 按钮放广告。
- `game-content` 必须出现在 `About` 和 `How to play` 等正文之后，实际距离游戏交互边缘明显超过 150px。
- 不创建贴着 Canvas 的桌面侧栏广告。
- 移动端广告不能出现在虚拟方向键、Restart、Next Level、Fullscreen 附近。
- 广告容器只能标记为 `Advertisement` 或保持无标题；不使用 `Recommended games`、`Resources` 等误导标签。
- 广告不得随游戏结束自动刷新。
- 广告不得作为进入下一关、继续游戏或领取奖励的条件。
- 进入 Fullscreen 后不显示页面广告。
- 为广告位预留合理最小高度，避免加载后推动游戏控制区；无配置时生产环境不渲染空白广告框。

## 9.2 游戏页 SEO 技术要求

- 每页唯一 Title、Meta Description、H1。
- Canonical 为绝对 HTTPS URL，且是自引用 Canonical。
- OG 与 Twitter 图片使用该游戏的 `og.webp`。
- HTML 首次响应中必须包含 H1、About、How to play、Tips 和 FAQ 文本。
- 不实现 `<meta name="keywords">`；`primaryKeyword` 只用于内容策划。
- JSON-LD：
  - `WebPage`
  - `BreadcrumbList`
  - 可添加语义性的 `VideoGame` / `WebApplication` 描述，但不要声称一定获得富结果。
- 不添加 `AggregateRating`、`Review`、`interactionStatistic` 或虚假玩家人数。
- FAQ 内容保留在页面中，但不要依赖 FAQ 富结果。
- 每张封面使用描述性文件名和 Alt。
- 相关推荐使用真实 `<a href>` / Next `<Link>`，不能只靠点击事件跳转。

---

# 10. G01–G20 游戏目录与英文首页卡片文案

| # | 游戏 | Slug | 类别 | 首页卡片介绍 |
|---|---|---|---|---|
| 1 | Block Bloom | `block-bloom` | Puzzle, Skill | Fit three colorful shapes at a time, clear complete rows and columns, and keep the board open. |
| 2 | Number Merge 2048 | `number-merge-2048` | Puzzle | Slide matching numbers together, build larger tiles, and try to reach 2048 without filling the grid. |
| 3 | Neon Snake | `neon-snake` | Arcade, Skill | Guide a glowing snake to food, grow longer, and survive an increasingly fast grid. |
| 4 | Sky Stack | `sky-stack` | Arcade, Skill | Drop moving platforms with perfect timing and build the tallest tower you can. |
| 5 | Zigzag Drift | `zigzag-drift` | Arcade, Skill | Switch direction at the right moment and keep a tiny car on an endless zigzag road. |
| 6 | Tap Hoops | `tap-hoops` | Arcade, Skill | Tap to lift the ball, pass cleanly through moving hoops, and keep the streak alive. |
| 7 | Color Pour | `color-pour` | Puzzle | Sort layered colors into matching tubes using as few pours as possible. |
| 8 | Penalty Hero | `penalty-hero` | Arcade, Skill | Take five shots, make five saves, and beat a fair computer opponent in a quick penalty match. |
| 9 | Slope Dash | `slope-dash` | Arcade, Skill | Steer a rolling ball down an endless neon track, dodge barriers, and survive the rising speed. |
| 10 | Helix Drop | `helix-drop` | Arcade, Skill | Rotate a tower, line up the gaps, and guide the bouncing ball past every dangerous platform. |
| 11 | Tunnel Flux | `tunnel-flux` | Arcade, Skill | Circle a rushing tunnel, find each opening, and avoid rotating geometric barriers. |
| 12 | Bubble Pop Shooter | `bubble-pop-shooter` | Puzzle, Arcade | Aim, match three bubbles, and drop unsupported clusters before the ceiling reaches the line. |
| 13 | Bolt Away | `bolt-away` | Puzzle, Skill | Remove bolts in the right order, free overlapping plates, and avoid filling every holding slot. |
| 14 | Unblock Path | `unblock-path` | Puzzle, Skill | Slide horizontal and vertical blocks to open a route for the highlighted piece. |
| 15 | Wave Rider | `wave-rider` | Arcade, Skill | Hold to climb, release to dive, and thread a sharp wave through a geometric course. |
| 16 | Fruit Slice Rush | `fruit-slice-rush` | Arcade, Skill | Swipe through flying fruit, build combos, and keep clear of the dark hazard orbs. |
| 17 | Hook Swing | `hook-swing` | Arcade, Skill | Attach to anchor points, release at the peak, and swing a small explorer to the finish. |
| 18 | Trap Runner | `trap-runner` | Arcade, Skill | Cross short platform rooms where floors shift, spikes appear, and every surprise remains learnable. |
| 19 | Rugged Wheels | `rugged-wheels` | Arcade, Skill | Balance a tiny two-wheel rover across ramps, bridges, bumps, and moving obstacles. |
| 20 | Classic Solitaire | `classic-solitaire` | Puzzle | Play a clean draw-one Klondike deal with click, drag, touch, undo, and no saved statistics. |


---

# 11. G01–G20 游戏详细规格与英文 SEO 内容

以下 SEO 和页面正文写入每款游戏的 `locales.en`；对应 `locales.zh` 内容见 Part III。`{{SITE_NAME}}` 在生成 Metadata 时由配置替换，不要把花括号输出到生产 HTML。

每个封面任务统一要求：

- 生成内容必须原创。
- 不出现热门游戏名、平台 Logo、真实球队/品牌、受保护角色。
- 不在图片内绘制游戏标题；标题由 HTML 覆盖。
- 不带水印。
- 源图保存在 `source.png`。
- 卡片图裁为 1200×675 的 `cover.webp`。
- 社交图从同一源图安全裁为 1200×630 的 `og.webp`。
- WebP 质量建议 80–84，卡片图优先控制在 160KB 内，不能以严重色带或模糊为代价。

## G01 · Block Bloom
### 页面与 SEO
| 字段 | 内容 |
|---|---|
| Logical route suffix | `/games/block-bloom` |
| Primary keyword | `free block puzzle game online` |
| SEO Title | `Block Bloom – Free Block Puzzle Game Online | {{SITE_NAME}}` |
| Meta description | `Place colorful shapes, clear rows and columns, and chase a new high score in Block Bloom, a free block puzzle you can play instantly in your browser.` |
| H1 | `Play Block Bloom Online` |
| Categories | Puzzle, Skill |
| Difficulty label | Easy to learn |
| Homepage card copy | Fit three colorful shapes at a time, clear complete rows and columns, and keep the board open. |

### 游戏设计

**核心玩法：** A 10×10 block-placement puzzle. The player receives three pieces, places all three, then receives a new set. Completed rows and columns clear immediately.

**操作：** Desktop: click a piece, then click a valid grid position; drag-and-drop is an enhancement. Mobile: tap a piece, then tap the highlighted destination; optional drag with pointer capture.

**规则：**

- Board size is 10×10. Pieces use original polyomino definitions of 1–5 cells and cannot rotate in v1.
- Generate a tray of three pieces. A new tray appears only after all three are placed.
- Clear every completed row and column in the same resolution step. Support multi-line clears and combo feedback.
- End the run when none of the remaining tray pieces can fit anywhere.

**计分与会话：** 1 point per placed cell; 10 points per cleared line; simultaneous lines receive a ×1.5 multiplier; consecutive scoring turns increase a visible combo up to ×3. No score is persisted.

### 实施要求

- Use React state and pure TypeScript rule functions; DOM/CSS Grid is preferred over Canvas for accessibility.
- Represent each piece as normalized cell offsets. Implement `canPlace`, `placePiece`, `findCompletedLines`, and `hasAnyMove` as independently tested pure functions.
- Animate clears with CSS only; honor `prefers-reduced-motion`.

### 页面公开正文

#### About Block Bloom

Block Bloom is a calm block puzzle built for short breaks and longer score-chasing sessions. Choose one of the three shapes below the board, place it on an open space, and complete full rows or columns to clear room. Every placement matters because pieces cannot be rotated and a crowded corner can block a future move. There is no timer, account, or saved progress, so you can focus entirely on planning the next few turns. A page refresh creates a fresh board and resets the score.

#### How to play

- Select one of the three available shapes.
- Place it on empty cells; occupied or out-of-bounds positions are rejected.
- Complete a full horizontal row or vertical column to clear it.
- Use all three shapes to receive the next set. The game ends when none can fit.

#### Tips

- Keep the center flexible instead of filling it too early.
- Create space for large squares and long bars before they appear.
- Look for placements that clear a row and a column at the same time.

#### FAQ

**Can I rotate the pieces?**

No. Block Bloom is balanced around fixed pieces, so planning the available orientation is part of the puzzle.

**Does Block Bloom save my high score?**

No. The first version stores all game state in memory, and refreshing the page starts a completely new run.

**Can I play on a phone?**

Yes. The board and tray resize for touch screens, and every action can be completed with taps.

**Related games（实现时通过当前 Locale 生成 URL）：** [Number Merge 2048](/{locale}/games/number-merge-2048), [Color Pour](/{locale}/games/color-pour), [Bubble Pop Shooter](/{locale}/games/bubble-pop-shooter), [Unblock Path](/{locale}/games/unblock-path)

### 关键验收测试

- Reject overlap and out-of-bounds placements.
- Clear simultaneous rows and columns exactly once.
- Detect game over only when every remaining piece has no legal placement.

### 封面生成

```text
CODEX_IMAGE_GEN_TASK
Output source: public/images/games/block-bloom/source.png
Final card: public/images/games/block-bloom/cover.webp (1200×675)
Final social: public/images/games/block-bloom/og.webp (1200×630)
Prompt:
Original polished arcade cover: a dark 10x10 board with rounded jewel-like block shapes fitting into rows, one horizontal and one vertical line glowing as they clear, deep navy background, violet and mint highlights, clean 3D isometric composition, no text, no logo, no watermark, 16:9.
Post-process:
Preserve the focal subject in both crops, convert to WebP quality 82, and verify that the final image accurately represents the implemented game.
```

---

## G02 · Number Merge 2048
### 页面与 SEO
| 字段 | 内容 |
|---|---|
| Logical route suffix | `/games/number-merge-2048` |
| Primary keyword | `play 2048 online free` |
| SEO Title | `Number Merge 2048 – Free Online Number Puzzle | {{SITE_NAME}}` |
| Meta description | `Slide and combine matching tiles in Number Merge 2048. Play this free browser number puzzle instantly on desktop or mobile with no sign-up or download.` |
| H1 | `Play Number Merge 2048 Online` |
| Categories | Puzzle |
| Difficulty label | Easy to learn |
| Homepage card copy | Slide matching numbers together, build larger tiles, and try to reach 2048 without filling the grid. |

### 游戏设计

**核心玩法：** A faithful 4×4 number-merging puzzle with original styling. Tiles slide in four directions; equal adjacent values merge once per move.

**操作：** Desktop: Arrow keys or WASD. Mobile: swipe up, down, left, or right. Also provide visible directional buttons for keyboard and assistive fallback.

**规则：**

- Start with two tiles, each valued 2 or 4.
- After a valid move that changes the board, spawn one new tile in a random empty cell.
- A tile created by a merge cannot merge again during the same move.
- Show a win dialog at 2048 with Continue and New Game. End only when the board is full and no merge exists.

**计分与会话：** Add the value of every newly merged tile to the score. Score, move count, and current board reset on refresh.

### 实施要求

- Use React state with a pure matrix engine. Separate `compressLine`, `mergeLine`, `moveBoard`, and `canMove`.
- Use stable tile IDs for animations so merged and spawned tiles animate correctly.
- Inject a random-number function into the engine to make tests deterministic.

### 页面公开正文

#### About Number Merge 2048

Number Merge 2048 is a clean browser version of the classic sliding number puzzle. Move every tile at once, combine equal values, and keep enough open cells for the next number. The rules are simple, but strong runs depend on consistent positioning and careful control of the largest tile. You can continue after reaching 2048 to explore higher values. Nothing is written to local storage, so a refresh shuffles a new opening and resets the board, score, and move count.

#### How to play

- Swipe or press an arrow key to move every tile in one direction.
- When two equal tiles meet, they combine into one tile with double the value.
- A new 2 or 4 appears after each move that changes the board.
- Reach 2048 to win, or continue until no legal move remains.

#### Tips

- Keep your largest tile in one corner and avoid moving it away.
- Build ordered rows so smaller tiles feed toward the largest value.
- Pause before every move when the board has only a few empty cells.

#### FAQ

**Is this the original 2048 code?**

No. The project must implement its own TypeScript engine, visual design, animations, and page content.

**Can I continue after making 2048?**

Yes. The win dialog includes a Continue option so you can attempt 4096 and beyond.

**Why did my game reset?**

Refreshing or reopening the page intentionally starts a new game because no progress is stored.

**Related games（实现时通过当前 Locale 生成 URL）：** [Block Bloom](/{locale}/games/block-bloom), [Color Pour](/{locale}/games/color-pour), [Unblock Path](/{locale}/games/unblock-path), [Classic Solitaire](/{locale}/games/classic-solitaire)

### 关键验收测试

- A created tile cannot merge twice in one move.
- Do not spawn a tile after an input that leaves the board unchanged.
- Recognize both the 2048 win state and the no-moves game-over state.

### 封面生成

```text
CODEX_IMAGE_GEN_TASK
Output source: public/images/games/number-merge-2048/source.png
Final card: public/images/games/number-merge-2048/cover.webp (1200×675)
Final social: public/images/games/number-merge-2048/og.webp (1200×630)
Prompt:
Original browser puzzle cover showing glossy numbered tiles 2, 4, 8, 16, 32, 64 and a luminous 2048 tile on a modern dark grid, elegant depth, warm amber and purple lighting, no copied interface, no text outside tile numbers, no logo, no watermark, 16:9.
Post-process:
Preserve the focal subject in both crops, convert to WebP quality 82, and verify that the final image accurately represents the implemented game.
```

---

## G03 · Neon Snake
### 页面与 SEO
| 字段 | 内容 |
|---|---|
| Logical route suffix | `/games/neon-snake` |
| Primary keyword | `classic snake game online` |
| SEO Title | `Neon Snake – Play the Classic Snake Game Online | {{SITE_NAME}}` |
| Meta description | `Play Neon Snake free in your browser. Eat glowing fruit, grow longer, and avoid walls and your own tail with keyboard or touch controls.` |
| H1 | `Play Neon Snake Online` |
| Categories | Arcade, Skill |
| Difficulty label | Easy |
| Homepage card copy | Guide a glowing snake to food, grow longer, and survive an increasingly fast grid. |

### 游戏设计

**核心玩法：** A grid-based classic snake game with a neon visual identity, responsive controls, increasing speed, and no persistent high score.

**操作：** Desktop: Arrow keys or WASD. Mobile: swipe anywhere on the game or use a four-button D-pad. Prevent page scrolling while an active swipe starts inside the game.

**规则：**

- Use a 24×24 logical grid. The snake advances one cell per tick.
- Food never spawns on the snake. Eating food adds one segment and increases score.
- Reverse-direction input is ignored to prevent instant self-collision.
- Wall or self collision ends the run. Speed increases every five foods up to a tested cap.

**计分与会话：** 10 points per food plus a speed bonus after each five-food milestone. Show current length and score; reset both on refresh.

### 实施要求

- Canvas 2D with crisp logical-grid rendering and a device-pixel-ratio cap of 2.
- Keep simulation ticks fixed and render between ticks. Queue at most one direction change per tick.
- Expose pure helpers for collision and valid food placement.

### 页面公开正文

#### About Neon Snake

Neon Snake turns the familiar grid challenge into a bright, responsive browser game. Collect each glowing fruit to extend the snake, but remember that every point also makes the board more crowded. The pace rises in small steps, rewarding controlled turns instead of frantic input. Keyboard, swipe, and on-screen controls all use the same rules. The game never sends or saves your score; refreshing the page returns the snake to its starting length and generates a new food position.

#### How to play

- Choose a direction with an arrow key, WASD, a swipe, or the on-screen pad.
- Eat the glowing fruit to grow by one segment and earn points.
- Avoid the outer wall and every part of your own tail.
- Survive as the movement speed increases.

#### Tips

- Plan turns one or two cells early at higher speeds.
- Use the outer edge only when you have a safe route back to open space.
- Avoid tight spirals that leave no exit for the head.

#### FAQ

**Can the snake move through walls?**

No. The outer wall is solid in this version, and touching it ends the run.

**Does the game work on touch screens?**

Yes. Swipe controls and a visible D-pad are both available.

**Is there a leaderboard?**

No. Scores exist only for the current page session.

**Related games（实现时通过当前 Locale 生成 URL）：** [Zigzag Drift](/{locale}/games/zigzag-drift), [Slope Dash](/{locale}/games/slope-dash), [Tunnel Flux](/{locale}/games/tunnel-flux), [Fruit Slice Rush](/{locale}/games/fruit-slice-rush)

### 关键验收测试

- Food never appears inside the snake body.
- Opposite-direction input is ignored.
- Speed increases at configured milestones without exceeding the maximum tick rate.

### 封面生成

```text
CODEX_IMAGE_GEN_TASK
Output source: public/images/games/neon-snake/source.png
Final card: public/images/games/neon-snake/cover.webp (1200×675)
Final social: public/images/games/neon-snake/og.webp (1200×630)
Prompt:
Original neon arcade cover: a luminous segmented snake curving across a dark square grid toward a glowing fruit, cyan and magenta light trails, readable silhouette, energetic but clean, no text, no brand logo, no watermark, 16:9.
Post-process:
Preserve the focal subject in both crops, convert to WebP quality 82, and verify that the final image accurately represents the implemented game.
```

---

## G04 · Sky Stack
### 页面与 SEO
| 字段 | 内容 |
|---|---|
| Logical route suffix | `/games/sky-stack` |
| Primary keyword | `tower stacking game online` |
| SEO Title | `Sky Stack – Free Tower Stacking Game Online | {{SITE_NAME}}` |
| Meta description | `Time every drop and build a tall, stable tower in Sky Stack, a free one-button stacking game for desktop and mobile browsers.` |
| H1 | `Play Sky Stack Online` |
| Categories | Arcade, Skill |
| Difficulty label | Easy |
| Homepage card copy | Drop moving platforms with perfect timing and build the tallest tower you can. |

### 游戏设计

**核心玩法：** A one-button timing game. A platform moves horizontally above the tower; the overlap becomes the next platform and the overhang falls away.

**操作：** Tap, click, or press Space/Enter to drop. R starts a new run only after game over; all visible buttons remain keyboard accessible.

**规则：**

- Begin with a wide fixed base and one moving platform.
- On drop, calculate overlap with the platform below. Keep the overlap and discard the overhang.
- A near-perfect placement within a small tolerance restores a little width, never above the starting width.
- No overlap ends the run. Movement speed and direction pattern become harder with height.

**计分与会话：** 1 point per successful layer; perfect placements add a streak bonus. Display tower height and best streak for the current run only.

### 实施要求

- Canvas 2D with simple pseudo-isometric shading; no external sprites.
- Use deterministic rectangle intersection math and a camera offset that follows the tower.
- Falling overhangs are visual particles only and must not affect gameplay.

### 页面公开正文

#### About Sky Stack

Sky Stack is a compact timing challenge about precision under pressure. Each new platform sweeps above the tower until you tap to drop it. Only the part that overlaps the layer below remains, so a small mistake makes every future placement harder. Perfect drops build a streak and can recover a little width. The controls use a single action, making the game comfortable on phones, keyboards, and trackpads. Refreshing the page removes the current tower and begins again from the base.

#### How to play

- Wait for the moving block to line up with the top of the tower.
- Tap, click, or press Space to drop it.
- Keep stacking while the usable platform becomes narrower.
- A complete miss ends the run.

#### Tips

- Watch the leading edge instead of the center of the block.
- Use a steady rhythm at lower levels, then adjust as speed changes.
- Perfect placements are valuable because they preserve or recover width.

#### FAQ

**What counts as a perfect drop?**

The two platform edges must land within the configured perfect-placement tolerance.

**Can I pause the game?**

Yes. The shared game toolbar includes Pause, and the game pauses automatically when the tab is hidden.

**Will my tower remain after refresh?**

No. Every tower exists only in the current page memory.

**Related games（实现时通过当前 Locale 生成 URL）：** [Zigzag Drift](/{locale}/games/zigzag-drift), [Tap Hoops](/{locale}/games/tap-hoops), [Wave Rider](/{locale}/games/wave-rider), [Slope Dash](/{locale}/games/slope-dash)

### 关键验收测试

- Overlap width is calculated correctly from both movement directions.
- A zero-overlap drop ends the game.
- Perfect placement never expands a platform beyond the original width.

### 封面生成

```text
CODEX_IMAGE_GEN_TASK
Output source: public/images/games/sky-stack/source.png
Final card: public/images/games/sky-stack/cover.webp (1200×675)
Final social: public/images/games/sky-stack/og.webp (1200×630)
Prompt:
Original arcade cover of a tall floating tower made from colorful rectangular platforms above soft clouds, one moving block about to land perfectly, dramatic upward perspective, purple night sky with mint glow, no text, no logo, no watermark, 16:9.
Post-process:
Preserve the focal subject in both crops, convert to WebP quality 82, and verify that the final image accurately represents the implemented game.
```

---

## G05 · Zigzag Drift
### 页面与 SEO
| 字段 | 内容 |
|---|---|
| Logical route suffix | `/games/zigzag-drift` |
| Primary keyword | `one tap driving game online` |
| SEO Title | `Zigzag Drift – Free One-Tap Driving Game Online | {{SITE_NAME}}` |
| Meta description | `Keep your car on a twisting road in Zigzag Drift. Tap to change direction, collect stars, and survive this free browser driving challenge.` |
| H1 | `Play Zigzag Drift Online` |
| Categories | Arcade, Skill |
| Difficulty label | Medium |
| Homepage card copy | Switch direction at the right moment and keep a tiny car on an endless zigzag road. |

### 游戏设计

**核心玩法：** A top-down endless path game. The vehicle continuously moves diagonally; each action switches between the two allowed directions.

**操作：** Tap/click/Space switches direction. Do not use hold-to-steer. The game begins only after an explicit Play action.

**规则：**

- Generate a connected zigzag road several segments ahead from a deterministic segment grammar.
- The car moves at constant forward speed and switches diagonal heading on input.
- Leaving the road polygon ends the run. Collectible stars appear only on reachable road centers.
- Increase speed gradually and recycle segments behind the camera.

**计分与会话：** Distance is the main score; stars add 25 points. Show a single-session best until refresh.

### 实施要求

- Canvas 2D with polygon hit testing and object pooling for road segments.
- Use swept collision or small fixed steps so the car cannot tunnel through narrow corners at high speed.
- Path generation must guarantee continuity and a minimum reaction distance.

### 页面公开正文

#### About Zigzag Drift

Zigzag Drift is a one-action driving game where timing matters more than complicated steering. Your car moves automatically along a floating road, and every tap switches its direction. Turn too early or too late and the car slips over the edge. Stars reward confident lines, while the road gradually speeds up and introduces tighter patterns. The entire route is generated for the current run, and refreshing the page resets the distance, stars, and temporary best score.

#### How to play

- Start the run and watch the next corner.
- Tap, click, or press Space to switch the car's diagonal direction.
- Stay inside the road and collect optional stars.
- Continue until the car leaves the path.

#### Tips

- Make each turn near the inside corner instead of the outer edge.
- Look one segment ahead rather than staring at the car.
- Skip a risky star when collecting it would ruin your line.

#### FAQ

**Can I steer left and right separately?**

No. A single action alternates between the two directions, which keeps the challenge simple and precise.

**Is the road always the same?**

No. Valid road sections are generated during each run.

**Does the game need a physics library?**

No. Polygon movement and collision should be implemented with lightweight custom math.

**Related games（实现时通过当前 Locale 生成 URL）：** [Sky Stack](/{locale}/games/sky-stack), [Slope Dash](/{locale}/games/slope-dash), [Wave Rider](/{locale}/games/wave-rider), [Rugged Wheels](/{locale}/games/rugged-wheels)

### 关键验收测试

- Generated road segments always connect without gaps.
- A direction switch changes heading once per input.
- Stars never spawn outside the reachable road centerline.

### 封面生成

```text
CODEX_IMAGE_GEN_TASK
Output source: public/images/games/zigzag-drift/source.png
Final card: public/images/games/zigzag-drift/cover.webp (1200×675)
Final social: public/images/games/zigzag-drift/og.webp (1200×630)
Prompt:
Original one-tap driving game cover: a tiny stylized car racing on a narrow floating zigzag road above a deep abstract void, glowing stars on the path, dynamic top-down perspective, violet and electric cyan lighting, no text, no logos, no watermark, 16:9.
Post-process:
Preserve the focal subject in both crops, convert to WebP quality 82, and verify that the final image accurately represents the implemented game.
```

---

## G06 · Tap Hoops
### 页面与 SEO
| 字段 | 内容 |
|---|---|
| Logical route suffix | `/games/tap-hoops` |
| Primary keyword | `basketball tap game online` |
| SEO Title | `Tap Hoops – Free Basketball Game Online | {{SITE_NAME}}` |
| Meta description | `Tap to bounce through moving baskets in Tap Hoops, a free one-button basketball game you can play instantly on desktop or mobile.` |
| H1 | `Play Tap Hoops Online` |
| Categories | Arcade, Skill |
| Difficulty label | Medium |
| Homepage card copy | Tap to lift the ball, pass cleanly through moving hoops, and keep the streak alive. |

### 游戏设计

**核心玩法：** A one-button endless basketball challenge. Repeated taps apply upward impulse; gravity pulls the ball down while the camera advances to new hoops.

**操作：** Tap/click/Space applies a capped upward impulse. On-screen Pause and Restart are outside the active play area.

**规则：**

- The ball starts left of the first hoop and moves horizontally at a controlled speed.
- A basket counts only when the ball crosses the hoop plane downward between the inner rim points.
- After a score, spawn the next hoop at a reachable vertical position and move the scene forward.
- Touching the floor or leaving the safe bounds ends the run.

**计分与会话：** 1 point per basket; a clean swish without rim contact adds a temporary ×2 streak bonus. Never count the same hoop twice.

### 实施要求

- Canvas 2D with custom circle, segment, and rim collision; use fixed-step integration.
- Track the previous and current ball position to detect downward plane crossing.
- Generate reachable hoop heights using the tested jump envelope.

### 页面公开正文

#### About Tap Hoops

Tap Hoops reduces basketball to one satisfying action. Tap to give the ball a short lift, let gravity bring it down, and guide it through each basket. Hoops move to new heights, so success comes from controlling the rhythm rather than tapping as quickly as possible. Clean swishes build a small score bonus, while a floor hit ends the run. There are no teams, licensed logos, accounts, or stored statistics. Reloading the page starts with the first hoop and a zero score.

#### How to play

- Tap, click, or press Space to push the ball upward.
- Let the ball fall through the hoop from above.
- Adjust the tapping rhythm for higher and lower baskets.
- Keep scoring until the ball touches the floor or exits the play area.

#### Tips

- Use short, spaced taps near the hoop instead of one long burst.
- Approach high hoops early so the ball can descend through the rim.
- Watch the ball's vertical speed, not only its position.

#### FAQ

**Why did a pass through the hoop not score?**

A valid basket must cross the scoring plane downward and remain between the inner rim points.

**Are real basketball teams included?**

No. The game uses an original neutral court and contains no league, player, or team branding.

**Can I play with one hand?**

Yes. Every gameplay action uses one tap or one key.

**Related games（实现时通过当前 Locale 生成 URL）：** [Penalty Hero](/{locale}/games/penalty-hero), [Sky Stack](/{locale}/games/sky-stack), [Fruit Slice Rush](/{locale}/games/fruit-slice-rush), [Zigzag Drift](/{locale}/games/zigzag-drift)

### 关键验收测试

- A hoop scores once only on a downward crossing.
- Rim contacts do not create duplicate points.
- Generated hoop positions remain reachable under the configured physics.

### 封面生成

```text
CODEX_IMAGE_GEN_TASK
Output source: public/images/games/tap-hoops/source.png
Final card: public/images/games/tap-hoops/cover.webp (1200×675)
Final social: public/images/games/tap-hoops/og.webp (1200×630)
Prompt:
Original arcade basketball cover: a bright ball arcing through a floating neon hoop with a clean swish, abstract night court, energetic motion trails, deep navy, orange and cyan palette, no teams, no text, no logo, no watermark, 16:9.
Post-process:
Preserve the focal subject in both crops, convert to WebP quality 82, and verify that the final image accurately represents the implemented game.
```

---

## G07 · Color Pour
### 页面与 SEO
| 字段 | 内容 |
|---|---|
| Logical route suffix | `/games/color-pour` |
| Primary keyword | `water sort puzzle online` |
| SEO Title | `Color Pour – Free Water Sort Puzzle Online | {{SITE_NAME}}` |
| Meta description | `Sort every color into its own tube in Color Pour, a free water sort puzzle with touch-friendly controls and handcrafted browser levels.` |
| H1 | `Play Color Pour Online` |
| Categories | Puzzle |
| Difficulty label | Easy to medium |
| Homepage card copy | Sort layered colors into matching tubes using as few pours as possible. |

### 游戏设计

**核心玩法：** A liquid-sort puzzle with handcrafted, guaranteed-solvable levels stored in static TypeScript data. Advance through levels in memory; refresh returns to level 1.

**操作：** Click/tap a source tube, then a destination tube. Escape or tapping the selected tube cancels. Buttons provide Undo, Restart Level, and Next Level after completion.

**规则：**

- A pour is legal when the destination is empty or its top color matches the source top color.
- Pour the largest contiguous group that fits; never split it unnecessarily.
- A level is complete when every non-empty tube contains one color and is full.
- Include at least 30 original levels, 4–8 colors, and up to two empty helper tubes.

**计分与会话：** Display move count and an optional par target. No stars, score history, or unlocked-level data persists after refresh.

### 实施要求

- Use DOM/SVG tubes and CSS transforms; keep rule logic in pure functions.
- Store levels as compact arrays and validate them at build/test time for capacity and color counts.
- Undo history lives only in component memory and is cleared on refresh or level change.

### 页面公开正文

#### About Color Pour

Color Pour is a relaxed sorting puzzle about moving the right group at the right time. Each tube holds layered colors, and a pour transfers the connected color from the top into an empty tube or onto the same color. The goal is to finish with one complete color in every used tube. Early levels explain the rule with generous space, while later layouts require temporary staging and careful ordering. Thirty original levels are bundled with the website; progress exists only while the page remains open.

#### How to play

- Select a tube that contains at least one color.
- Choose an empty tube or one whose top color matches.
- Continue pouring until every used tube contains only one color.
- Use Undo for the current session or Restart Level to restore its initial layout.

#### Tips

- Use empty tubes as temporary workspace, not permanent storage.
- Finish a full single-color tube when doing so does not block another color.
- Before pouring, check which color will be exposed underneath.

#### FAQ

**Are the puzzles randomly generated?**

The launch version uses original handcrafted level data so every published puzzle can be tested and solved.

**Does Undo survive a refresh?**

No. Undo history and level progress are memory-only.

**Can I skip a level?**

The normal flow requires solving the current level, but a developer-only level picker may be available in test mode.

**Related games（实现时通过当前 Locale 生成 URL）：** [Block Bloom](/{locale}/games/block-bloom), [Bolt Away](/{locale}/games/bolt-away), [Unblock Path](/{locale}/games/unblock-path), [Classic Solitaire](/{locale}/games/classic-solitaire)

### 关键验收测试

- Reject pours onto a different top color or a full tube.
- Move the complete contiguous top group up to destination capacity.
- Recognize completion without treating empty tubes as unfinished.

### 封面生成

```text
CODEX_IMAGE_GEN_TASK
Output source: public/images/games/color-pour/source.png
Final card: public/images/games/color-pour/cover.webp (1200×675)
Final social: public/images/games/color-pour/og.webp (1200×630)
Prompt:
Original relaxing puzzle cover: transparent glass tubes filled with layered glowing liquids in distinct colors, one smooth pour connecting matching colors, dark elegant tabletop, soft violet and mint light, no text, no logo, no watermark, 16:9.
Post-process:
Preserve the focal subject in both crops, convert to WebP quality 82, and verify that the final image accurately represents the implemented game.
```

---

## G08 · Penalty Hero
### 页面与 SEO
| 字段 | 内容 |
|---|---|
| Logical route suffix | `/games/penalty-hero` |
| Primary keyword | `soccer penalty game online` |
| SEO Title | `Penalty Hero – Free Soccer Penalty Game Online | {{SITE_NAME}}` |
| Meta description | `Shoot, save, and win a fast penalty contest in Penalty Hero, a free single-player soccer game with no teams, download, or sign-up.` |
| H1 | `Play Penalty Hero Online` |
| Categories | Arcade, Skill |
| Difficulty label | Easy |
| Homepage card copy | Take five shots, make five saves, and beat a fair computer opponent in a quick penalty match. |

### 游戏设计

**核心玩法：** A short single-player penalty contest against a transparent, seeded AI. The player alternates between five shots and five saves.

**操作：** Shoot: swipe from the ball or drag an aim arrow, then release. Save: choose one of five goal zones with tap/click or keyboard numbers 1–5.

**规则：**

- Run five shooting rounds and five goalkeeping rounds, alternating roles.
- Shot direction follows aim; power and height derive from gesture length within safe caps.
- The AI goalkeeper chooses a zone using weighted but non-reactive randomness. The AI shooter commits before the player's save choice.
- Most goals wins; tied matches enter alternating sudden death.

**计分与会话：** Show goals, saves, round, and final result. Do not record match history. Refresh returns to round one.

### 实施要求

- Canvas 2D or layered DOM/SVG. Use simple projected ball motion rather than full 3D physics.
- Make AI decisions before the outcome input to prevent cheating; expose the seed in tests only.
- Use generic kits, flags, stadium, and trophy shapes with no real club or federation marks.

### 页面公开正文

#### About Penalty Hero

Penalty Hero delivers a complete soccer shootout in a few minutes. Aim each kick, balance placement with power, and then switch roles to read the computer's shot. The opponent uses committed choices rather than reacting after your input, so every save remains fair. Five shots and five saves determine the result, with sudden death if the scores are level. The stadium, uniforms, and cup are entirely fictional, and no match history or personal information is stored.

#### How to play

- Drag or swipe from the ball to choose shot direction and power.
- When defending, select one of five save zones before the kick.
- Alternate between shooting and goalkeeping for five rounds each.
- Win by scoring more goals, or continue into sudden death after a tie.

#### Tips

- Mix corner placement with occasional central shots.
- Use controlled power; maximum force should be less accurate.
- When saving, avoid repeating an obvious pattern.

#### FAQ

**Does the computer react after seeing my choice?**

No. AI choices are committed before the relevant player input is resolved.

**Are real teams available?**

No. All visual identities are original to avoid trademark and licensing issues.

**How long is one match?**

A normal match contains ten total attempts, plus sudden death only when tied.

**Related games（实现时通过当前 Locale 生成 URL）：** [Tap Hoops](/{locale}/games/tap-hoops), [Zigzag Drift](/{locale}/games/zigzag-drift), [Rugged Wheels](/{locale}/games/rugged-wheels), [Slope Dash](/{locale}/games/slope-dash)

### 关键验收测试

- AI choice is fixed before player resolution.
- Match ends after regulation when scores differ and enters sudden death when tied.
- A shot outside the goal frame cannot score.

### 封面生成

```text
CODEX_IMAGE_GEN_TASK
Output source: public/images/games/penalty-hero/source.png
Final card: public/images/games/penalty-hero/cover.webp (1200×675)
Final social: public/images/games/penalty-hero/og.webp (1200×630)
Prompt:
Original soccer penalty game cover: a fictional striker taking a dramatic penalty toward a diving goalkeeper in a stylized floodlit stadium, generic uniforms with no logos, clear ball trajectory, cinematic arcade art, no text, no watermark, 16:9.
Post-process:
Preserve the focal subject in both crops, convert to WebP quality 82, and verify that the final image accurately represents the implemented game.
```

---

## G09 · Slope Dash
### 页面与 SEO
| 字段 | 内容 |
|---|---|
| Logical route suffix | `/games/slope-dash` |
| Primary keyword | `rolling ball slope game online` |
| SEO Title | `Slope Dash – Free Rolling Ball Game Online | {{SITE_NAME}}` |
| Meta description | `Steer a fast ball down a glowing endless track in Slope Dash. Dodge barriers, cross gaps, and chase distance in this free browser game.` |
| H1 | `Play Slope Dash Online` |
| Categories | Arcade, Skill |
| Difficulty label | Medium |
| Homepage card copy | Steer a rolling ball down an endless neon track, dodge barriers, and survive the rising speed. |

### 游戏设计

**核心玩法：** A pseudo-3D endless rolling-ball game rendered in Canvas 2D. The ball moves forward automatically on a perspective track with lanes, gaps, ramps, and barriers.

**操作：** Desktop: Left/Right arrows or A/D. Mobile: drag horizontally or use two large edge buttons. Downward page gestures outside the canvas still scroll normally.

**规则：**

- Generate track chunks from a library of tested patterns with safe transitions.
- Steering changes lateral velocity with damping; forward speed rises gradually.
- Barrier collision or falling through a gap ends the run.
- Coins are optional and must never require an impossible line.

**计分与会话：** Distance increases continuously; coins add 20 points. Show speed tier and current run score only.

### 实施要求

- Use custom perspective projection from simple 3D coordinates into Canvas 2D; do not add Three.js.
- Simulate collision in world coordinates, not screen pixels.
- Pre-generate enough track for reaction time and recycle old chunks.

### 页面公开正文

#### About Slope Dash

Slope Dash is a fast rolling-ball challenge built around smooth steering and readable obstacles. The track stretches toward the horizon while barriers, gaps, and ramps demand small corrections. Speed increases in measured tiers, allowing a run to become intense without changing the controls. Optional coins reward riskier paths, but every generated section must remain possible. The track, score, and coin count are created for the current page session and disappear after a refresh.

#### How to play

- Move left or right while the ball rolls forward automatically.
- Stay on the track and avoid solid barriers.
- Cross ramps and choose safe lines around gaps.
- Travel as far as possible before falling or crashing.

#### Tips

- Use short corrections; holding a direction too long creates excess momentum.
- Center the ball before a new track pattern appears.
- Prioritize survival over coins when speed is high.

#### FAQ

**Is Slope Dash a true 3D game?**

It uses lightweight world coordinates and perspective rendering in Canvas 2D, keeping the download small.

**Are track sections random?**

They are assembled from original, pre-tested patterns with rules that prevent impossible transitions.

**Can I use a keyboard and touch screen?**

Yes. Both control methods map to the same steering model.

**Related games（实现时通过当前 Locale 生成 URL）：** [Tunnel Flux](/{locale}/games/tunnel-flux), [Helix Drop](/{locale}/games/helix-drop), [Zigzag Drift](/{locale}/games/zigzag-drift), [Wave Rider](/{locale}/games/wave-rider)

### 关键验收测试

- Every adjacent track chunk has a valid connection.
- World-space collision matches visible barriers and gaps.
- Speed increases smoothly and respects the configured maximum.

### 封面生成

```text
CODEX_IMAGE_GEN_TASK
Output source: public/images/games/slope-dash/source.png
Final card: public/images/games/slope-dash/cover.webp (1200×675)
Final social: public/images/games/slope-dash/og.webp (1200×630)
Prompt:
Original futuristic rolling-ball game cover: a glossy luminous sphere racing down a steep segmented neon track over a dark geometric city, visible barriers and a safe gap route, strong depth and speed, cyan and violet glow, no text, no logo, no watermark, 16:9.
Post-process:
Preserve the focal subject in both crops, convert to WebP quality 82, and verify that the final image accurately represents the implemented game.
```

---

## G10 · Helix Drop
### 页面与 SEO
| 字段 | 内容 |
|---|---|
| Logical route suffix | `/games/helix-drop` |
| Primary keyword | `helix ball game online` |
| SEO Title | `Helix Drop – Free Helix Ball Game Online | {{SITE_NAME}}` |
| Meta description | `Rotate the tower and drop a bouncing ball through safe gaps in Helix Drop, a free touch-friendly browser arcade game.` |
| H1 | `Play Helix Drop Online` |
| Categories | Arcade, Skill |
| Difficulty label | Medium |
| Homepage card copy | Rotate a tower, line up the gaps, and guide the bouncing ball past every dangerous platform. |

### 游戏设计

**核心玩法：** A pseudo-3D tower game. The player rotates stacked circular platforms around a central column while a ball bounces vertically.

**操作：** Drag left/right on touch or mouse to rotate. Arrow keys provide an accessible alternative. The ball bounces automatically.

**规则：**

- Each platform is an angular ring with one or more gaps and marked danger arcs.
- When the descending ball angle is over a gap, it falls to the next platform.
- Landing on a normal arc bounces; landing on a danger arc ends the run.
- Pass a fixed number of platforms to complete a tower, then generate a new in-memory tower with higher difficulty.

**计分与会话：** 1 point per platform passed; consecutive drops through multiple rings grant a combo. Refresh resets to tower one.

### 实施要求

- Render elliptical rings in Canvas 2D sorted by vertical depth.
- Collision uses platform height, ball vertical crossing, and normalized angular position.
- Tower generation must guarantee at least one feasible path and avoid overlapping all safe arcs.

### 页面公开正文

#### About Helix Drop

Helix Drop asks you to rotate the world instead of moving the ball. The ball bounces on stacked rings while you drag the tower to place a gap underneath it. Safe landings buy time; danger segments end the run; long drops through several openings build a combo. Towers are assembled from original ring patterns and become more demanding after each completion. No tower progress is saved, so refreshing the page always returns to a newly generated first tower.

#### How to play

- Drag left or right to rotate every platform around the central column.
- Place a gap beneath the falling ball so it can descend.
- Avoid marked danger sections when the ball lands.
- Pass the required number of rings to finish the tower.

#### Tips

- Rotate while the ball is rising so the target gap is ready before descent.
- Use small movements near a danger arc.
- Look several rings below when attempting a combo drop.

#### FAQ

**Why does the tower rotate instead of the ball?**

The ball follows automatic vertical physics; your only task is aligning the platforms.

**Are levels stored?**

Platform patterns are bundled or generated in the browser, but completed towers are not persisted.

**Does the game require WebGL?**

No. The visual depth is created with Canvas 2D ellipses and sorting.

**Related games（实现时通过当前 Locale 生成 URL）：** [Slope Dash](/{locale}/games/slope-dash), [Tunnel Flux](/{locale}/games/tunnel-flux), [Wave Rider](/{locale}/games/wave-rider), [Sky Stack](/{locale}/games/sky-stack)

### 关键验收测试

- Angular gap and danger detection handles wraparound at 0/2π.
- A platform is resolved only once per downward crossing.
- Generated towers always contain a valid safe route.

### 封面生成

```text
CODEX_IMAGE_GEN_TASK
Output source: public/images/games/helix-drop/source.png
Final card: public/images/games/helix-drop/cover.webp (1200×675)
Final social: public/images/games/helix-drop/og.webp (1200×630)
Prompt:
Original helix arcade cover: a glowing ball dropping through gaps in a tall spiral tower of circular platforms, safe violet surfaces and clearly contrasting coral danger arcs, deep perspective, sleek 3D illustration, no text, no logo, no watermark, 16:9.
Post-process:
Preserve the focal subject in both crops, convert to WebP quality 82, and verify that the final image accurately represents the implemented game.
```

---

## G11 · Tunnel Flux
### 页面与 SEO
| 字段 | 内容 |
|---|---|
| Logical route suffix | `/games/tunnel-flux` |
| Primary keyword | `3d tunnel game online` |
| SEO Title | `Tunnel Flux – Free 3D Tunnel Game Online | {{SITE_NAME}}` |
| Meta description | `Race through a glowing obstacle tunnel in Tunnel Flux. Rotate around the walls, find each opening, and survive this free browser reflex game.` |
| H1 | `Play Tunnel Flux Online` |
| Categories | Arcade, Skill |
| Difficulty label | Hard |
| Homepage card copy | Circle a rushing tunnel, find each opening, and avoid rotating geometric barriers. |

### 游戏设计

**核心玩法：** A first-person pseudo-3D reflex game. The player occupies an angle around a tunnel circumference while obstacle rings approach along the depth axis.

**操作：** Left/Right arrows or A/D rotate; touch drag around the game area. Provide an optional sensitivity slider that is not persisted.

**规则：**

- Obstacle rings contain blocked arcs and at least one safe opening.
- Move the player angle into a safe arc before the ring reaches the camera plane.
- Some rings rotate at predictable speeds; never combine speed and opening size into impossible patterns.
- Collision ends the run; forward velocity rises by tier.

**计分与会话：** Distance and passed-ring count. A narrow-gap bonus may add points but cannot alter survival rules.

### 实施要求

- Canvas 2D radial projection; draw rings from far to near for correct depth.
- Use angular interval collision with wraparound and depth crossing detection.
- Generate patterns from validated templates with minimum opening width and lead time.

### 页面公开正文

#### About Tunnel Flux

Tunnel Flux is a high-speed reflex game set inside a glowing geometric tunnel. Move around the circular wall to line up with openings before each barrier reaches you. Early rings teach the movement with wide gaps, while later patterns rotate or combine arcs to test anticipation. The tunnel uses lightweight Canvas perspective rather than a large 3D engine, so it starts quickly on both desktop and mobile. Every run begins from zero after a refresh.

#### How to play

- Move left or right to rotate around the tunnel wall.
- Identify the open arc in each approaching barrier.
- Align with the gap before the ring reaches the foreground.
- Pass as many rings as possible without touching a blocked section.

#### Tips

- Read the next two rings instead of reacting only to the closest one.
- Return toward a neutral angle after extreme movements.
- For rotating barriers, aim where the opening will be, not where it is now.

#### FAQ

**Can I change control sensitivity?**

Yes. A session-only slider changes rotation sensitivity and resets on refresh.

**Does Tunnel Flux use motion controls?**

No. Launch controls are keyboard and touch drag only.

**Are flashing effects used?**

No rapid full-screen flashes are allowed; color and glow effects must remain accessibility-safe.

**Related games（实现时通过当前 Locale 生成 URL）：** [Slope Dash](/{locale}/games/slope-dash), [Helix Drop](/{locale}/games/helix-drop), [Wave Rider](/{locale}/games/wave-rider), [Zigzag Drift](/{locale}/games/zigzag-drift)

### 关键验收测试

- Angular collision supports intervals crossing zero degrees.
- Obstacle templates satisfy minimum gap and reaction-time constraints.
- The same ring cannot register both pass and collision.

### 封面生成

```text
CODEX_IMAGE_GEN_TASK
Output source: public/images/games/tunnel-flux/source.png
Final card: public/images/games/tunnel-flux/cover.webp (1200×675)
Final social: public/images/games/tunnel-flux/og.webp (1200×630)
Prompt:
Original first-person tunnel game cover: viewpoint rushing through concentric glowing polygon rings, one clear safe opening ahead and rotating geometric barriers, strong vanishing point, dark navy with cyan, violet and coral light, no text, no logo, no watermark, 16:9.
Post-process:
Preserve the focal subject in both crops, convert to WebP quality 82, and verify that the final image accurately represents the implemented game.
```

---

## G12 · Bubble Pop Shooter
### 页面与 SEO
| 字段 | 内容 |
|---|---|
| Logical route suffix | `/games/bubble-pop-shooter` |
| Primary keyword | `bubble shooter online free` |
| SEO Title | `Bubble Pop Shooter – Free Bubble Shooter Online | {{SITE_NAME}}` |
| Meta description | `Aim and match colorful bubbles in Bubble Pop Shooter. Clear clusters, drop hanging bubbles, and play free online with no sign-up.` |
| H1 | `Play Bubble Pop Shooter Online` |
| Categories | Puzzle, Arcade |
| Difficulty label | Easy |
| Homepage card copy | Aim, match three bubbles, and drop unsupported clusters before the ceiling reaches the line. |

### 游戏设计

**核心玩法：** A hex-grid bubble shooter with original colors and effects. Match groups of three or more; unsupported bubbles fall.

**操作：** Move pointer or finger to aim; release/click to shoot. Keyboard Left/Right aims and Space fires. Show a projected bank-shot guide for one wall bounce.

**规则：**

- Attach fired bubbles to the nearest valid hex cell.
- Flood-fill same-color neighbors; remove groups of at least three.
- After removal, find all bubbles disconnected from the ceiling and drop them.
- After a configurable number of non-clearing shots, add a new row. Lose when a bubble crosses the danger line.

**计分与会话：** 10 per matched bubble, 20 per dropped bubble, and a chain multiplier for consecutive clearing shots.

### 实施要求

- Canvas 2D with axial or offset hex coordinates.
- Separate geometric aim/collision from grid-resolution logic.
- Limit palette to five colors and add symbols/patterns so color is not the only distinction.

### 页面公开正文

#### About Bubble Pop Shooter

Bubble Pop Shooter combines precise aiming with light puzzle planning. Fire a bubble into the hexagonal field, connect at least three of the same type, and remove any cluster that loses its link to the ceiling. Missed clears eventually add another row, so bank shots and well-chosen targets matter. Symbols accompany the colors for better visibility. The board is generated for the current run only, and a refresh starts with a new arrangement and zero score.

#### How to play

- Aim the launcher with the pointer, touch, or keyboard.
- Fire into a matching group to create a cluster of three or more.
- Use side-wall bounces to reach protected areas.
- Clear the board before bubbles cross the danger line.

#### Tips

- Target support bubbles to drop large groups at once.
- Check the next bubble before committing to a narrow shot.
- Keep the center open so both wall angles remain useful.

#### FAQ

**Can bubbles bounce off the walls?**

Yes. The aim guide previews one wall bounce before the shot.

**Is the game color-blind friendly?**

Every bubble color also uses a distinct small symbol or pattern.

**Does the board stay after refresh?**

No. The opening layout and score reset.

**Related games（实现时通过当前 Locale 生成 URL）：** [Block Bloom](/{locale}/games/block-bloom), [Color Pour](/{locale}/games/color-pour), [Bolt Away](/{locale}/games/bolt-away), [Number Merge 2048](/{locale}/games/number-merge-2048)

### 关键验收测试

- Hex attachment chooses a valid nearest empty cell.
- Same-color flood fill removes only groups of three or more.
- Disconnected clusters are detected from ceiling-connected cells.

### 封面生成

```text
CODEX_IMAGE_GEN_TASK
Output source: public/images/games/bubble-pop-shooter/source.png
Final card: public/images/games/bubble-pop-shooter/cover.webp (1200×675)
Final social: public/images/games/bubble-pop-shooter/og.webp (1200×630)
Prompt:
Original bubble shooter cover: a sleek launcher aiming a bright bubble into a suspended hexagonal cluster of colorful symbol-marked bubbles, several unsupported bubbles falling with sparkles, dark arcade background, no text, no logo, no watermark, 16:9.
Post-process:
Preserve the focal subject in both crops, convert to WebP quality 82, and verify that the final image accurately represents the implemented game.
```

---

## G13 · Bolt Away
### 页面与 SEO
| 字段 | 内容 |
|---|---|
| Logical route suffix | `/games/bolt-away` |
| Primary keyword | `nuts and bolts puzzle online` |
| SEO Title | `Bolt Away – Free Nuts and Bolts Puzzle Online | {{SITE_NAME}}` |
| Meta description | `Unscrew bolts, release layered plates, and manage limited holding slots in Bolt Away, a free original browser puzzle.` |
| H1 | `Play Bolt Away Online` |
| Categories | Puzzle, Skill |
| Difficulty label | Medium |
| Homepage card copy | Remove bolts in the right order, free overlapping plates, and avoid filling every holding slot. |

### 游戏设计

**核心玩法：** A static-level order puzzle inspired by mechanical disassembly, using original SVG plates and bolts. It does not reproduce another game's levels or art.

**操作：** Click/tap an available bolt to move it into the first open holding slot. Click a slotted bolt and a valid empty hole to move it when a level permits. Keyboard navigation cycles bolts and confirms.

**规则：**

- Each plate defines the bolts that secure it and a z-order for overlap.
- Removing all securing bolts releases the plate with a short animation.
- Bolts occupy a limited row of holding slots; matching sets of three identical bolt colors clear from the slots.
- The level fails when every slot is occupied and no automatic set clears.

**计分与会话：** Show move count, remaining plates, and optional par. Advance through at least 20 bundled levels in memory; refresh returns to level 1.

### 实施要求

- Render plates and holes as SVG for responsive hit areas.
- Store each level as validated JSON/TypeScript: plate polygons, bolt coordinates, colors, dependencies, slots, and solution metadata.
- Write an offline solver used only in tests/build validation to confirm every level is solvable.

### 页面公开正文

#### About Bolt Away

Bolt Away is an original mechanical sorting puzzle about order and limited space. Tap an exposed bolt to remove it, match sets in the holding tray, and release each overlapping plate once its fasteners are gone. A move that looks useful can block the tray later, so the next few colors matter as much as the current plate. Launch includes at least twenty hand-built, solver-verified levels. Level progress and undo history stay in memory and return to the first puzzle when the page reloads.

#### How to play

- Select an exposed, removable bolt.
- The bolt moves to the first open holding slot.
- Create sets of three matching bolt colors to clear tray space.
- Remove every required bolt and release all plates to complete the level.

#### Tips

- Check upcoming exposed colors before filling the final empty slot.
- Release upper plates early to reveal more choices.
- Use Undo before a full tray becomes unrecoverable.

#### FAQ

**Are these levels copied from another bolt game?**

No. Every plate layout, dependency, color sequence, and visual asset must be original.

**How do you know a level can be solved?**

A build-time solver validates that each published level has at least one legal solution.

**Is progress saved?**

No. Refreshing starts level 1, while normal in-page advancement works until the tab is reloaded.

**Related games（实现时通过当前 Locale 生成 URL）：** [Color Pour](/{locale}/games/color-pour), [Unblock Path](/{locale}/games/unblock-path), [Block Bloom](/{locale}/games/block-bloom), [Classic Solitaire](/{locale}/games/classic-solitaire)

### 关键验收测试

- A covered or locked bolt cannot be selected.
- Three matching tray bolts clear deterministically.
- Every bundled level passes the solver and schema validation.

### 封面生成

```text
CODEX_IMAGE_GEN_TASK
Output source: public/images/games/bolt-away/source.png
Final card: public/images/games/bolt-away/cover.webp (1200×675)
Final social: public/images/games/bolt-away/og.webp (1200×630)
Prompt:
Original mechanical puzzle cover: layered abstract metal and wooden plates secured by colorful round bolts, a few bolts moving into a tidy holding tray, premium clean 3D render, dark workshop backdrop, no recognizable game UI, no text, no logo, no watermark, 16:9.
Post-process:
Preserve the focal subject in both crops, convert to WebP quality 82, and verify that the final image accurately represents the implemented game.
```

---

## G14 · Unblock Path
### 页面与 SEO
| 字段 | 内容 |
|---|---|
| Logical route suffix | `/games/unblock-path` |
| Primary keyword | `sliding block puzzle online` |
| SEO Title | `Unblock Path – Free Sliding Block Puzzle Online | {{SITE_NAME}}` |
| Meta description | `Move blocking pieces and guide the highlighted block to the exit in Unblock Path, a free sliding puzzle with original browser levels.` |
| H1 | `Play Unblock Path Online` |
| Categories | Puzzle, Skill |
| Difficulty label | Medium |
| Homepage card copy | Slide horizontal and vertical blocks to open a route for the highlighted piece. |

### 游戏设计

**核心玩法：** A classic sliding-block logic game on a 6×6 board with original handcrafted levels. Pieces move only along their orientation.

**操作：** Drag a piece along its axis or click it and use arrow keys. Provide Undo and Restart Level. Touch targets must meet minimum size.

**规则：**

- Horizontal blocks move left/right; vertical blocks move up/down.
- Blocks cannot overlap or leave the board, except the target crossing the designated exit.
- Complete a level when the target block exits the board.
- Include at least 30 original levels with verified minimum solution lengths.

**计分与会话：** Move count compared with a displayed par. No stars or unlocks persist.

### 实施要求

- DOM/CSS Grid or Canvas; DOM is preferred for semantic focusable pieces.
- Represent occupied cells from piece definitions and validate every move with a pure reducer.
- Use breadth-first search in tests to verify solvability and calculate par values.

### 页面公开正文

#### About Unblock Path

Unblock Path is a compact logic puzzle about making space in a crowded grid. Every block can slide only along its long axis, and the highlighted piece must reach the side exit. The early boards can be solved in a few moves; later ones require moving a blocker away, using the new space, and then returning another piece to a better position. Thirty original puzzles ship as static level data. Refreshing the browser returns to level one and clears the current move history.

#### How to play

- Drag a block only along its horizontal or vertical orientation.
- Move blockers into open cells to create a route.
- Guide the highlighted target through the exit.
- Use Undo to review the current attempt or Restart Level to begin that board again.

#### Tips

- Work backward from the exit and identify the final blocker.
- A move away from the target can create the space needed later.
- Compare your move count with par only after finding a reliable solution.

#### FAQ

**Can blocks rotate?**

No. Each block keeps its original orientation for the entire level.

**How is the par score chosen?**

An automated breadth-first solver calculates the minimum solution length for each bundled puzzle.

**Will I return to my last level tomorrow?**

No. The site intentionally stores no game progress.

**Related games（实现时通过当前 Locale 生成 URL）：** [Bolt Away](/{locale}/games/bolt-away), [Color Pour](/{locale}/games/color-pour), [Number Merge 2048](/{locale}/games/number-merge-2048), [Classic Solitaire](/{locale}/games/classic-solitaire)

### 关键验收测试

- Pieces move only along their declared axis.
- Collision and board boundaries reject illegal moves.
- BFS verifies all levels and supplied par values.

### 封面生成

```text
CODEX_IMAGE_GEN_TASK
Output source: public/images/games/unblock-path/source.png
Final card: public/images/games/unblock-path/cover.webp (1200×675)
Final social: public/images/games/unblock-path/og.webp (1200×630)
Prompt:
Original sliding block puzzle cover: a polished 6x6 tray filled with rounded horizontal and vertical blocks, one bright highlighted block aligned toward an open side exit, modern tactile materials, dark background, no text, no logo, no watermark, 16:9.
Post-process:
Preserve the focal subject in both crops, convert to WebP quality 82, and verify that the final image accurately represents the implemented game.
```

---

## G15 · Wave Rider
### 页面与 SEO
| 字段 | 内容 |
|---|---|
| Logical route suffix | `/games/wave-rider` |
| Primary keyword | `one button wave game online` |
| SEO Title | `Wave Rider – Free One-Button Wave Game Online | {{SITE_NAME}}` |
| Meta description | `Hold to rise and release to fall in Wave Rider, a fast one-button browser game packed with original geometric obstacle courses.` |
| H1 | `Play Wave Rider Online` |
| Categories | Arcade, Skill |
| Difficulty label | Hard |
| Homepage card copy | Hold to climb, release to dive, and thread a sharp wave through a geometric course. |

### 游戏设计

**核心玩法：** A one-button wave-navigation game. The player moves forward automatically along straight diagonal slopes: hold rises, release falls.

**操作：** Hold mouse/touch/Space to rise; release to fall. Prevent context menus and scrolling only during an active game gesture.

**规则：**

- Movement uses fixed diagonal speed rather than free acceleration.
- Colliding with any course boundary or obstacle ends the run.
- Generate course chunks with verified corridors and reaction time.
- Collect optional shards placed on valid paths.

**计分与会话：** Distance plus 10 points per shard. Speed and corridor complexity rise by tier, with a hard accessibility-safe cap.

### 实施要求

- Canvas 2D with swept line collision against polygon boundaries.
- Represent each course chunk as top/bottom polylines and optional internal obstacles.
- Build a validation sampler that confirms at least one legal hold/release path through each template.

### 页面公开正文

#### About Wave Rider

Wave Rider is a pure timing game controlled by holding and releasing. The wave climbs on a fixed diagonal while you hold the input and dives when you let go, creating a sharp zigzag path through narrow geometric corridors. Original course pieces are assembled ahead of the player and validated so they remain possible. Optional shards encourage precise routes, but survival always comes first. Reloading the page resets the course, distance, and temporary score.

#### How to play

- Hold touch, mouse, or Space to move diagonally upward.
- Release to move diagonally downward.
- Stay between the course boundaries and avoid interior obstacles.
- Collect shards only when the route remains safe.

#### Tips

- Use short pulses in narrow corridors instead of long holds.
- Aim for the center of an opening before the next direction change.
- Learn the fixed slope angle; the wave does not drift or accelerate vertically.

#### FAQ

**Is the control analog?**

No. The wave has two fixed directions, which makes every outcome depend on timing.

**Are impossible patterns possible?**

No published template may ship unless the validation sampler finds a legal path.

**Can the page scroll while I play?**

Touch scrolling is prevented only for gestures that begin inside the active game area.

**Related games（实现时通过当前 Locale 生成 URL）：** [Tunnel Flux](/{locale}/games/tunnel-flux), [Slope Dash](/{locale}/games/slope-dash), [Hook Swing](/{locale}/games/hook-swing), [Zigzag Drift](/{locale}/games/zigzag-drift)

### 关键验收测试

- Hold and release produce exact opposite diagonal slopes.
- Swept collision catches high-speed boundary crossings.
- Every template passes automated path validation.

### 封面生成

```text
CODEX_IMAGE_GEN_TASK
Output source: public/images/games/wave-rider/source.png
Final card: public/images/games/wave-rider/cover.webp (1200×675)
Final social: public/images/games/wave-rider/og.webp (1200×630)
Prompt:
Original geometric wave game cover: a bright triangular energy wave tracing a sharp zigzag through a dark neon corridor with clean openings and crystalline shards, high contrast, dynamic side view, no text, no logo, no watermark, 16:9.
Post-process:
Preserve the focal subject in both crops, convert to WebP quality 82, and verify that the final image accurately represents the implemented game.
```

---

## G16 · Fruit Slice Rush
### 页面与 SEO
| 字段 | 内容 |
|---|---|
| Logical route suffix | `/games/fruit-slice-rush` |
| Primary keyword | `fruit slicing game online` |
| SEO Title | `Fruit Slice Rush – Free Fruit Slicing Game Online | {{SITE_NAME}}` |
| Meta description | `Swipe to slice flying fruit, build combos, and avoid hazard orbs in Fruit Slice Rush, a free touch-friendly browser arcade game.` |
| H1 | `Play Fruit Slice Rush Online` |
| Categories | Arcade, Skill |
| Difficulty label | Easy |
| Homepage card copy | Swipe through flying fruit, build combos, and keep clear of the dark hazard orbs. |

### 游戏设计

**核心玩法：** A pointer-swipe slicing game with stylized original fruit shapes, procedural launch arcs, combo scoring, three misses, and non-graphic effects.

**操作：** Drag pointer or finger across fruit. Mouse movement without an active press does not slice. Keyboard accessibility offers a focus cursor moved with arrows and Space to cut nearby targets.

**规则：**

- Launch fruit in readable arcs from below the scene.
- A swipe segment intersecting a fruit circle slices it once and produces two simple halves/particles.
- Missing three fruit ends the run. Intersecting a dark hazard orb ends the run immediately.
- Spawn rate and mixed waves increase gradually; never hide hazards directly behind fruit.

**计分与会话：** 10 points per fruit; multiple fruit cut by one continuous swipe receive an escalating combo. No score persists.

### 实施要求

- Canvas 2D with line-segment/circle intersection and pooled particles.
- Use vector fruit drawings, not copied sprites. Effects are juice-colored sparkles without gore.
- Cap active objects and particles for mobile performance.

### 页面公开正文

#### About Fruit Slice Rush

Fruit Slice Rush is a quick swipe challenge with bright, non-graphic effects. Fruit rises in arcs across the screen, and a single clean gesture can cut several pieces for a combo. Missing three fruit ends the run, while touching a dark hazard orb ends it immediately. Spawn patterns become busier without placing hazards unfairly behind targets. Everything is drawn with original Canvas shapes, and refreshing the page clears the score and starts a new sequence.

#### How to play

- Press and drag across a fruit to slice it.
- Cut several fruit in one continuous gesture to build a combo.
- Let no more than two fruit fall without being sliced.
- Avoid every dark hazard orb.

#### Tips

- Use smooth, deliberate lines rather than scribbling across the screen.
- Wait a fraction of a second for grouped fruit to align.
- Lift the pointer when a hazard enters the path.

#### FAQ

**Is there graphic violence?**

No. Fruit separates into simple shapes and colorful particles only.

**Can accidental mouse movement slice fruit?**

No. A cut occurs only while the primary pointer is actively pressed.

**Does the game support keyboard input?**

Yes. A slower focus-cursor mode offers an alternative, while touch or pointer swipes remain the primary control.

**Related games（实现时通过当前 Locale 生成 URL）：** [Tap Hoops](/{locale}/games/tap-hoops), [Neon Snake](/{locale}/games/neon-snake), [Wave Rider](/{locale}/games/wave-rider), [Sky Stack](/{locale}/games/sky-stack)

### 关键验收测试

- A fruit scores at most once.
- One swipe can score multiple fruit and calculate the correct combo.
- Hazards are not spawned fully occluded behind fruit at launch.

### 封面生成

```text
CODEX_IMAGE_GEN_TASK
Output source: public/images/games/fruit-slice-rush/source.png
Final card: public/images/games/fruit-slice-rush/cover.webp (1200×675)
Final social: public/images/games/fruit-slice-rush/og.webp (1200×630)
Prompt:
Original fruit slicing arcade cover: colorful stylized fruit flying in graceful arcs while a luminous swipe cuts through several pieces, one clearly separate dark hazard orb, sparkling non-graphic juice effects, deep navy background, no text, no logo, no watermark, 16:9.
Post-process:
Preserve the focal subject in both crops, convert to WebP quality 82, and verify that the final image accurately represents the implemented game.
```

---

## G17 · Hook Swing
### 页面与 SEO
| 字段 | 内容 |
|---|---|
| Logical route suffix | `/games/hook-swing` |
| Primary keyword | `hook swing game online` |
| SEO Title | `Hook Swing – Free Grappling Swing Game Online | {{SITE_NAME}}` |
| Meta description | `Attach, swing, and release through original obstacle courses in Hook Swing, a free grappling skill game for browser and mobile.` |
| H1 | `Play Hook Swing Online` |
| Categories | Arcade, Skill |
| Difficulty label | Medium |
| Homepage card copy | Attach to anchor points, release at the peak, and swing a small explorer to the finish. |

### 游戏设计

**核心玩法：** A physics swing game featuring an original orb-like explorer. Attach to valid anchors, release to preserve momentum, and reach the finish across static levels.

**操作：** Hold/tap an anchor to attach; release input to detach. Space attaches to the nearest valid anchor in the forward cone. R restarts the current level.

**规则：**

- An anchor is attachable only within maximum rope distance and clear line of sight.
- Rope length is fixed during an attachment in v1.
- Touching a hazard or falling below the level resets that level.
- Include at least 15 short original levels. In-page completion advances; refresh returns to level 1.

**计分与会话：** Level time and optional collectible count; no persisted medals or records.

### 实施要求

- Use Matter.js in this game's lazy-loaded chunk or a small Verlet pendulum engine. Do not load physics code on other pages.
- Define anchors, hazards, spawn, finish, and collectibles in static level files.
- Render the character as simple original vector geometry, not a stickman copied from another game.

### 页面公开正文

#### About Hook Swing

Hook Swing is a momentum puzzle about choosing when to hold on and when to let go. Attach the explorer to a nearby anchor, swing through the arc, and release near the peak to travel toward the next point. Short original levels introduce moving from anchor to anchor, clearing hazards, and collecting optional sparks. The physics module loads only after you press Play. Level progress lasts for the open page and resets to the first course after a refresh.

#### How to play

- Attach to a visible anchor within rope range.
- Keep holding while the explorer swings around the point.
- Release to carry momentum toward the next anchor.
- Reach the finish marker without touching a hazard or falling.

#### Tips

- Release shortly before the highest point to convert the swing into forward travel.
- Choose a lower anchor when you need speed and a higher anchor when you need height.
- Do not attach too early if the rope would pull you backward.

#### FAQ

**Can the rope change length?**

Not in v1. A fixed rope length keeps controls predictable and easier to learn.

**How many levels are included?**

At least fifteen tested, original levels are required for launch.

**Is Matter.js loaded on the homepage?**

No. The physics dependency must be dynamically imported only after this game starts.

**Related games（实现时通过当前 Locale 生成 URL）：** [Trap Runner](/{locale}/games/trap-runner), [Rugged Wheels](/{locale}/games/rugged-wheels), [Wave Rider](/{locale}/games/wave-rider), [Slope Dash](/{locale}/games/slope-dash)

### 关键验收测试

- Reject anchors outside range or blocked by geometry.
- Detaching preserves tangential velocity.
- Every level can be completed in an automated or recorded smoke path.

### 封面生成

```text
CODEX_IMAGE_GEN_TASK
Output source: public/images/games/hook-swing/source.png
Final card: public/images/games/hook-swing/cover.webp (1200×675)
Final social: public/images/games/hook-swing/og.webp (1200×630)
Prompt:
Original grappling swing game cover: a small glowing orb explorer swinging from a cable between floating anchor points over geometric hazards, clear arc and forward motion, playful premium arcade art, violet sky and mint highlights, no text, no logo, no watermark, 16:9.
Post-process:
Preserve the focal subject in both crops, convert to WebP quality 82, and verify that the final image accurately represents the implemented game.
```

---

## G18 · Trap Runner
### 页面与 SEO
| 字段 | 内容 |
|---|---|
| Logical route suffix | `/games/trap-runner` |
| Primary keyword | `trap platformer game online` |
| SEO Title | `Trap Runner – Free Platform Trap Game Online | {{SITE_NAME}}` |
| Meta description | `Run, jump, learn the surprises, and clear original obstacle rooms in Trap Runner, a free browser platform game with no graphic violence.` |
| H1 | `Play Trap Runner Online` |
| Categories | Arcade, Skill |
| Difficulty label | Hard |
| Homepage card copy | Cross short platform rooms where floors shift, spikes appear, and every surprise remains learnable. |

### 游戏设计

**核心玩法：** A short-room 2D platformer with original tile maps and surprising but fair triggers. No blood, copied levels, characters, or branding.

**操作：** Desktop: A/D or arrows to move, W/Up/Space to jump. Mobile: left/right and jump buttons. Coyote time and jump buffering are required.

**规则：**

- Each room has a start, exit, static solids, hazards, moving platforms, and optional trigger tiles.
- Death instantly resets the current room after a short non-graphic animation.
- Triggers must be telegraphed on first encounter or become predictable after one failure.
- Include at least 15 original rooms; completing one advances in memory, refresh returns to room 1.

**计分与会话：** Deaths and room time are shown for the current session only. The primary goal is completion, not a global score.

### 实施要求

- Canvas 2D tile engine with axis-separated collision and a fixed timestep.
- Store rooms in static JSON/TypeScript. Trigger scripts use a constrained declarative schema, not `eval`.
- Provide developer hitbox/debug overlay behind a non-production flag.

### 页面公开正文

#### About Trap Runner

Trap Runner is a compact platform game where the obvious route may change beneath your feet. Floors can drop, spikes can rise, and exits can shift, but every surprise must remain readable or learnable rather than random. Responsive movement includes coyote time and jump buffering so failures feel tied to decisions. Fifteen original rooms form a complete launch set with no graphic effects. Reloading the page returns to the first room and resets the session death counter.

#### How to play

- Move left or right and jump across the room.
- Watch for visual clues that mark unstable or triggered objects.
- After a failure, use what changed to choose a safer route.
- Reach the exit to advance to the next room.

#### Tips

- Test suspicious floor sections with a short approach.
- Use the jump buffer near landing edges for consistent movement.
- Do not rush a newly revealed trap; most rooms reward a brief pause.

#### FAQ

**Are the traps random?**

No. Each room uses authored trigger rules so players can learn from a failure.

**Does the game show blood?**

No. Failure uses a simple dissolve or reset animation.

**Are these levels taken from Level Devil or Vex?**

No. All maps, trigger sequences, characters, art, and code must be original.

**Related games（实现时通过当前 Locale 生成 URL）：** [Hook Swing](/{locale}/games/hook-swing), [Rugged Wheels](/{locale}/games/rugged-wheels), [Wave Rider](/{locale}/games/wave-rider), [Neon Snake](/{locale}/games/neon-snake)

### 关键验收测试

- Coyote time and jump buffering work within configured windows.
- Room reset restores every trigger and moving object.
- All 15 rooms have a verified completion path.

### 封面生成

```text
CODEX_IMAGE_GEN_TASK
Output source: public/images/games/trap-runner/source.png
Final card: public/images/games/trap-runner/cover.webp (1200×675)
Final social: public/images/games/trap-runner/og.webp (1200×630)
Prompt:
Original trap platformer cover: a tiny friendly geometric runner jumping across a compact side-view room as a floor tile drops and clearly marked spikes rise, expressive but non-graphic, dark premium arcade palette, no text, no logo, no watermark, 16:9.
Post-process:
Preserve the focal subject in both crops, convert to WebP quality 82, and verify that the final image accurately represents the implemented game.
```

---

## G19 · Rugged Wheels
### 页面与 SEO
| 字段 | 内容 |
|---|---|
| Logical route suffix | `/games/rugged-wheels` |
| Primary keyword | `physics driving game online` |
| SEO Title | `Rugged Wheels – Free Physics Driving Game Online | {{SITE_NAME}}` |
| Meta description | `Drive and balance a small rover across original obstacle tracks in Rugged Wheels, a free browser physics game for keyboard and touch.` |
| H1 | `Play Rugged Wheels Online` |
| Categories | Arcade, Skill |
| Difficulty label | Medium |
| Homepage card copy | Balance a tiny two-wheel rover across ramps, bridges, bumps, and moving obstacles. |

### 游戏设计

**核心玩法：** A side-view vehicle balance game with an original compact rover and short obstacle tracks. It uses 2D rigid-body physics and no licensed vehicles.

**操作：** Desktop: Right/W accelerates, Left/S brakes or reverses, A/D tilts in air. Mobile: four large control buttons. Pause is separate.

**规则：**

- Reach the finish with the rover body and at least one wheel intact/on track.
- Head/body impact beyond a threshold or falling out of bounds resets the current level.
- Checkpoints may exist inside longer tracks but are memory-only.
- Include at least 12 original tracks with ramps, seesaws, bridges, rollers, and gentle moving obstacles.

**计分与会话：** Level time and collected bolts. No saved vehicle upgrades, currency, or progression.

### 实施要求

- Lazy-load Matter.js only after Play. Build rover from chassis, two wheels, axles, and constraints.
- Store track geometry in static level files and use simple vector surfaces.
- Use fixed physics parameters and automated replay smoke tests to reduce browser variance.

### 页面公开正文

#### About Rugged Wheels

Rugged Wheels is a side-view balance challenge starring a small original rover. Accelerate carefully across ramps, flexible bridges, rollers, and seesaws while keeping the chassis under control. Air tilt helps prepare for landings, but speed is rarely the only answer. Twelve bundled tracks increase in complexity without adding upgrades, currencies, or saved progress. Checkpoints work only during the current level, and refreshing the page returns to the first track.

#### How to play

- Accelerate or reverse to move the rover along the track.
- Use air tilt to line up the wheels before landing.
- Slow down for seesaws, narrow bridges, and moving obstacles.
- Cross the finish marker to advance to the next track.

#### Tips

- Release acceleration before the crest of a steep ramp.
- Land on both wheels when possible to protect the chassis.
- Use small reverse inputs to recover from an over-rotation.

#### FAQ

**Does the game use a real vehicle brand?**

No. The rover and every visual element are original generic designs.

**Are upgrades required?**

No. Every level uses the same balanced vehicle parameters.

**What happens at a checkpoint?**

A crash restarts from the latest checkpoint during that open level only.

**Related games（实现时通过当前 Locale 生成 URL）：** [Hook Swing](/{locale}/games/hook-swing), [Trap Runner](/{locale}/games/trap-runner), [Zigzag Drift](/{locale}/games/zigzag-drift), [Slope Dash](/{locale}/games/slope-dash)

### 关键验收测试

- Vehicle constraints remain stable at target frame rates.
- Crash and out-of-bounds conditions reset the correct checkpoint.
- All tracks have a recorded successful smoke run.

### 封面生成

```text
CODEX_IMAGE_GEN_TASK
Output source: public/images/games/rugged-wheels/source.png
Final card: public/images/games/rugged-wheels/cover.webp (1200×675)
Final social: public/images/games/rugged-wheels/og.webp (1200×630)
Prompt:
Original physics driving cover: a charming compact two-wheel rover balancing over a rugged floating obstacle track with a ramp, seesaw and bridge, side view, dynamic suspension, premium colorful arcade rendering, no brand marks, no text, no logo, no watermark, 16:9.
Post-process:
Preserve the focal subject in both crops, convert to WebP quality 82, and verify that the final image accurately represents the implemented game.
```

---

## G20 · Classic Solitaire
### 页面与 SEO
| 字段 | 内容 |
|---|---|
| Logical route suffix | `/games/classic-solitaire` |
| Primary keyword | `classic solitaire online free` |
| SEO Title | `Classic Solitaire – Play Klondike Solitaire Free | {{SITE_NAME}}` |
| Meta description | `Play free draw-one Klondike Solitaire in your browser. Move cards by click, drag, or touch, use undo, and start a fresh shuffled deal anytime.` |
| H1 | `Play Classic Solitaire Online` |
| Categories | Puzzle |
| Difficulty label | Classic |
| Homepage card copy | Play a clean draw-one Klondike deal with click, drag, touch, undo, and no saved statistics. |

### 游戏设计

**核心玩法：** A draw-one Klondike solitaire implementation using CSS-rendered cards and standard rules. The deck is shuffled in-browser; no images, account, or statistics service.

**操作：** Click-to-select then click destination is required. Drag/drop and touch dragging are enhancements. Keyboard navigation moves focus across piles and activates selected cards.

**规则：**

- Seven tableau columns contain 1–7 cards with only the top card face up; remaining cards form stock.
- Tableau builds downward in alternating colors. Empty tableau accepts a king or a king-led sequence.
- Foundations build upward by suit from ace to king.
- Draw one from stock; recycle waste to stock when empty. Undo is session-only. Win when all 52 cards reach foundations.

**计分与会话：** Show moves and elapsed time for the current deal. Do not implement persistent win rate, streaks, or leaderboards.

### 实施要求

- Use semantic DOM buttons/cards and CSS suit symbols; no copyrighted deck artwork.
- Model every move as a reversible command for Undo.
- Use a cryptographically seeded Fisher–Yates shuffle in production and deterministic seeds in tests.

### 页面公开正文

#### About Classic Solitaire

Classic Solitaire provides a focused draw-one Klondike game with a clean, original card design. Build descending alternating-color sequences in the tableau, reveal hidden cards, and move each suit to its foundation from ace through king. You can play with click-to-move, drag, touch, or keyboard navigation, and Undo remains available during the current deal. The shuffle, move count, and timer are never saved; a browser refresh deals a completely new game.

#### How to play

- Move face-up cards onto the next higher rank of the opposite color.
- Place kings or king-led sequences into empty tableau columns.
- Turn cards from the stock and play useful waste cards.
- Build each foundation by suit from ace to king to win.

#### Tips

- Reveal face-down tableau cards before making low-value foundation moves.
- Keep empty columns available for kings that unlock hidden cards.
- Use Undo to inspect alternatives, but remember it resets with the page.

#### FAQ

**Is this draw one or draw three?**

The launch version uses draw-one rules for broad accessibility.

**Are all deals guaranteed to be solvable?**

No. Standard shuffled Klondike can produce deals that are not winnable.

**Does the site track wins?**

No. Win state, time, and moves are held only for the current page session.

**Related games（实现时通过当前 Locale 生成 URL）：** [Number Merge 2048](/{locale}/games/number-merge-2048), [Block Bloom](/{locale}/games/block-bloom), [Color Pour](/{locale}/games/color-pour), [Unblock Path](/{locale}/games/unblock-path)

### 关键验收测试

- Enforce alternating-color tableau and same-suit foundation rules.
- Reveal a newly exposed tableau card after a valid move.
- Undo restores stock, waste, tableau, foundation, score, and face-up state exactly.

### 封面生成

```text
CODEX_IMAGE_GEN_TASK
Output source: public/images/games/classic-solitaire/source.png
Final card: public/images/games/classic-solitaire/cover.webp (1200×675)
Final social: public/images/games/classic-solitaire/og.webp (1200×630)
Prompt:
Original elegant solitaire cover: a clean spread of custom minimalist playing cards on a dark felt surface, visible ace foundation and alternating red-black tableau sequence, subtle violet and mint accents, no copied deck back, no text, no logo, no watermark, 16:9.
Post-process:
Preserve the focal subject in both crops, convert to WebP quality 82, and verify that the final image accurately represents the implemented game.
```

---

# 12. SEO 实施细则（G01–G20 内容参考；最终实现以 Part 0 为准）

## 12.1 Metadata

> **禁止直接复制旧版单语言 Metadata。** 最终实现必须使用 Part 0 的统一 `buildLocalizedMetadata()` 或等价实现，为 `/en/...` 和 `/zh/...` 分别生成本地化 Title、Description、Canonical、Open Graph、Twitter Card、Robots 与 `alternates.languages`。

G01–G20 的英文 SEO 字段来自各游戏章节；对应中文字段来自 Part III。实现要求：

- 英文页面 `<html lang="en">`，中文页面 `<html lang="zh-CN">`。
- 每个语言页使用自引用 Canonical，不得把中文页 canonical 到英文页。
- 每个可索引页面同时列出 `en`、`zh-CN` 和 `x-default`，并与对应页面互惠。
- `x-default` 指向同一逻辑页面的英文版本；根 `/` 固定重定向到 `/en`。
- Title 与可见 H1 主题一致，但不要求逐字相同。
- Meta description 必须独立、自然且与实际玩法一致，不堆砌关键词。
- Production 为 `index,follow,max-image-preview:large`；Vercel Preview 与 Development 为 `noindex,nofollow,noarchive`。
- 站长验证通过环境变量插入。
- 不输出 `meta keywords`。

## 12.2 Sitemap

`src/app/sitemap.ts` 必须从统一静态目录生成最终双语 URL：

- 2 个首页 URL。
- 8 个分类 URL（4 个逻辑分类 × 2 种语言）。
- 2 个 Garden Logic 集合 URL。
- 58 个游戏 URL（29 个逻辑游戏 × 2 种语言；其中 G01–G20 占 40 个）。
- About、Contact、Accessibility、Privacy、Cookies、Terms 等页面的双语 URL。

要求：

- 每个条目使用唯一 Production HTTPS Canonical URL。
- 每个成对页面包含 `alternates.languages`：`en`、`zh-CN`、`x-default`。
- `lastModified` 来自静态 `CONTENT_LAST_UPDATED`，不要在每次构建时把全部页面伪装成刚刚更新。
- 游戏页 `changeFrequency` 可设为 `monthly`，首页可设为 `weekly`。
- 不把 Vercel Preview、查询参数、Hash、404、源图片或动态 Chunk 加入 Sitemap。
- 自动测试校验 58 个游戏 URL 全部存在、无重复且语言替代关系完整。

## 12.3 Robots

Production：

```text
User-agent: *
Allow: /

Sitemap: https://YOUR_DOMAIN/sitemap.xml
```

Preview/Development 构建：

```text
User-agent: *
Disallow: /
```

不要屏蔽 Googlebot、AdsBot-Google、Mediapartners-Google、图片目录或游戏正文，否则可能影响索引和广告内容评估。

## 12.4 Canonical、Hreflang 与域名

- 选择 `https://www.example.com` 或 `https://example.com` 中的一个作为唯一 Production 主机名，另一版本永久重定向。
- `/en/...` 与 `/zh/...` 都是独立 Canonical 页面；每页 Canonical 指向自身语言 URL。
- 每页列出自身和对应语言的互惠 `hreflang`，并提供 `x-default`。
- 页面、Sitemap、Open Graph、JSON-LD 与内部链接始终使用同一 Production 主机名。
- 查询参数不创建新内容页，也不进入 Sitemap。
- 不根据 IP、浏览器语言、Cookie 或 `Accept-Language` 自动重定向已明确访问的语言 URL。

## 12.5 JSON-LD

首页：

- `WebSite`
- `Organization`

游戏页：

- `WebPage`
- `BreadcrumbList`
- 可添加 `VideoGame`，属性只描述页面中真实可见的信息：
  - `name`
  - `description`
  - `url`
  - `image`
  - `genre`
  - `gamePlatform: "Web browser"`
  - `playMode: "SinglePlayer"`
  - `isAccessibleForFree: true`

不要添加：

- 虚假 `aggregateRating`。
- 虚假 `review`。
- 虚假玩家人数。
- 没有实际站内搜索路由时的 `SearchAction`。
- 页面不可见或与页面不一致的数据。

Google 对单独的 `VideoGame` 不保证 Software App 富结果。不要为了富结果伪造评分；先使用诚实的语义标记和 Breadcrumb。

双语要求：

- 英文实体使用英文 `name`、`description` 与 `inLanguage: "en"`。
- 中文实体使用中文 `name`、`description` 与 `inLanguage: "zh-CN"`。
- `url`、`mainEntityOfPage`、Breadcrumb 与 ItemList 链接均指向当前语言 URL。
- FAQ 结构化数据如保留，问题与回答必须与当前语言页面可见内容完全一致；不得把两种语言混在同一个实体中。

## 12.6 On-page SEO

每个游戏页必须：

- 一个清晰 H1。
- 至少包含本文的 About、How to play、Tips、FAQ。
- 不把所有正文藏在 Accordion 中；About 与 How to play 默认可见。
- 用 H2/H3 建立自然层级。
- 使用独立图片 Alt。
- 相关推荐使用描述性锚文本。
- 不批量生成“Game 1/2/3”或只替换名称的重复文案。
- 不使用看不见的关键词、关键词堆砌或门页。
- 游戏 Canvas 之外仍有足够可读取内容。
- 页面首屏 Play 按钮语义明确，不伪装成下载按钮。

## 12.7 图片 SEO

- 文件名使用 Slug，例如 `block-bloom-browser-game-cover.webp` 也可以，但项目内保持统一。
- 图片旁边有相关游戏标题与描述。
- `alt` 描述画面，不堆关键词。
- OG 图片高分辨率、可抓取、无登录限制。
- 不在结构化数据中使用通用 Logo 代替游戏图。
- 首页首个主要封面可 `priority`，其余卡片懒加载。
- 每张图片必须声明宽高，避免 CLS。

---

# 13. Google AdSense 接入方案

## 13.1 原则

上线代码要具备 AdSense 接入能力，但在以下条件满足前默认关闭：

- 站点内容完整。
- 域名已绑定。
- Privacy、Cookie、Terms 和 Contact 可访问。
- AdSense 已添加并批准站点。
- Publisher ID、Client ID、广告位 ID 已设置。
- CMP 已配置。
- `ads.txt` 已生成。
- 广告布局通过人工检查。

广告不是游戏逻辑的一部分。任何广告未填充都不能阻止游戏运行。

## 13.2 环境变量

`.env.example`：

```bash
NEXT_PUBLIC_SITE_NAME=ArcadeMint
NEXT_PUBLIC_SITE_URL=https://example.com
NEXT_PUBLIC_CONTACT_EMAIL=hello@example.com
NEXT_PUBLIC_LEGAL_NAME=ArcadeMint
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
NEXT_PUBLIC_BING_SITE_VERIFICATION=

NEXT_PUBLIC_ENABLE_ADSENSE=false
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-0000000000000000
ADSENSE_PUBLISHER_ID=pub-0000000000000000
NEXT_PUBLIC_ADSENSE_SLOT_HOME_INLINE=
NEXT_PUBLIC_ADSENSE_SLOT_CATEGORY_INLINE=
NEXT_PUBLIC_ADSENSE_SLOT_GAME_CONTENT=
NEXT_PUBLIC_ADSENSE_SLOT_GAME_BOTTOM=
```

约束：

- `NEXT_PUBLIC_ENABLE_ADSENSE` 不为 `true` 时，不加载 AdSense Script、不渲染 `<ins class="adsbygoogle">`。
- Client ID 或 Slot 缺失时安全返回 `null`。
- Development 显示明确写着 `Ad placeholder – development only` 的虚线框；Production 不显示开发占位。
- 不把 Publisher ID 当作秘密，但保持配置集中。

## 13.3 Script 与 `AdSlot`

- 根 Layout 使用 `next/script`，只加载一次：
  - `strategy="afterInteractive"`。
  - URL 使用 Google 官方 AdSense Script。
  - `crossOrigin="anonymous"`。
- `AdSlot` 是 Client Component。
- 每次挂载只执行一次 `(window.adsbygoogle = window.adsbygoogle || []).push({})`。
- 捕获并仅在开发环境记录重复初始化错误。
- 不通过定时器刷新 Slot。
- 客户端页面导航后，新 Slot 在新组件 Mount 时初始化；旧 Slot 不复用为“刷新广告”。
- 广告容器固定最大宽度并预留尺寸，防止加载后移动交互元素。

## 13.4 位置

首页：

- `home-inline-1`：Featured 和完整目录之间。
- `home-inline-2`：分类/Why 区块之后、FAQ 之前。

分类页：

- `category-inline`：至少 6 张游戏卡片之后。

游戏页：

- `game-content`：About 与 How to play 之后，远离游戏。
- `game-bottom`：相关推荐之后、Footer 之前。
- 不在 Canvas 左右放广告。
- 不在 Game Over、Pause、Level Complete、Restart 和 Next Level 附近放广告。

## 13.5 `ads.txt`

创建 `scripts/generate-ads-txt.mjs`：

- 若 `ADSENSE_PUBLISHER_ID` 符合 `pub-\d+`，在构建前生成：

```text
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

- 若未配置，则不要生成虚假的授权行。
- 上线后验证 `https://YOUR_DOMAIN/ads.txt` 返回 200 且内容与 AdSense 后台完全一致。
- `robots.txt` 不得阻止 `ads.txt`。

## 13.6 CMP 与隐私

面向 EEA、英国和瑞士流量时：

- 在 AdSense `Privacy & messaging` 中启用 Google CMP 或其他 Google 认证 CMP。
- 使用符合当期要求的 IAB TCF 版本；截至本规格日期，应满足 TCF v2.3。
- 配置 Consent、Do not consent、Manage options。
- Privacy Policy URL 填写生产站 `/privacy`。
- Cookie Policy URL 填写 `/cookies`。
- 同时检查适用的美国州隐私消息。
- 不自行制作一个仅有“Accept”而没有拒绝/管理选项的假 Banner。
- 不在自定义代码与 Google CMP 之间重复弹窗。

## 13.7 禁止事项

- 不提示用户点击广告。
- 不用箭头、闪烁、奖励或游戏目标引导广告点击。
- 不把广告设计成游戏卡片、Play、Next、Download 或导航。
- 不自动刷新页面或广告。
- 不在游戏加载等待期间强制展示定时广告。
- 不因广告加载而改变游戏按钮位置。
- 站点所有者与开发者不得点击自己的真实广告。
- 首发建议关闭 Anchor/Vignette 等可能干扰游戏的 Auto Ads 形式，先用本文定义的手动内容广告位；后续只能在真实设备上审查后调整。

---

# 14. 品牌与法律页面

这些页面使用站点配置填充品牌、域名、邮箱、法律主体和生效日期。Codex 必须生成完整英文与简体中文页面；正式投放广告前，站点所有者仍需进行法律审查。

## 14.1 About

SEO：

```text
Title: About {{SITE_NAME}} – Original Browser Games
Description: Learn how {{SITE_NAME}} builds original, lightweight browser games that work without downloads, accounts, or saved progress.
H1: About {{SITE_NAME}}
```

正文：

```text
{{SITE_NAME}} is a collection of original mini games designed to run directly in modern web browsers. The launch library includes puzzles, arcade challenges, sports rounds, platform courses, physics games, and classic solitaire.

The site does not require an account, profile, download, or cloud save. Game state exists only while the current page is open. Refreshing a game starts a new run, deal, or first level.

Game mechanics may belong to familiar genres, but the launch code, names, visual assets, sound effects, level data, and written guides are created for this project. For questions, accessibility feedback, or copyright concerns, contact {{CONTACT_EMAIL}}.
```

## 14.2 Contact

- 不做表单，因为没有后端。
- 提供 `mailto:`：
  - General questions。
  - Accessibility feedback。
  - Copyright/IP notices。
  - Advertising/business。
- 显示正常文本邮箱，避免只有 Icon。
- SEO Title：`Contact {{SITE_NAME}}`
- 提醒用户不要发送密码或敏感个人信息。

## 14.3 Privacy Policy

至少覆盖：

1. 生效日期。
2. 站点所有者与联系邮箱。
3. 不创建用户账户。
4. 不由本站保存游戏进度、分数或关卡。
5. Vercel 托管可能处理常规请求日志、IP、User-Agent 和安全信息。
6. Google AdSense/CMP 可能使用 Cookie、设备标识符和相关技术，取决于地区、同意状态和广告设置。
7. Google Privacy & Terms 的链接。
8. EEA/UK/Switzerland Consent 与撤回方式。
9. 美国州隐私选项。
10. 数据保留由相关服务商政策与站点配置决定。
11. 一般受众与儿童条款：站点不专门面向 13 岁以下儿童。
12. 国际处理。
13. Policy 更新。
14. 联系方式。

不要写“我们绝不收集任何数据”，因为托管和广告服务可能处理技术数据。

## 14.4 Cookie Policy

说明：

- 游戏状态不使用 Cookie、localStorage 或 IndexedDB。
- 必要 Cookie 可能由同意管理组件用于记录隐私选择。
- 广告 Cookie/类似技术可能由 Google 及批准合作伙伴使用。
- 用户可通过 CMP 管理选择。
- 浏览器设置可删除 Cookie，但这可能导致隐私选择再次弹出。
- 列出政策更新时间与邮箱。

## 14.5 Terms

至少包含：

- 接受条款。
- 免费、按现状提供。
- 允许个人正常游玩。
- 禁止攻击、逆向滥用、自动化刷广告、作弊流量、抓取素材后重新分发。
- 原创游戏与站点内容的知识产权。
- 第三方广告与链接。
- 无保证与合理责任限制。
- 可更新/暂停服务。
- 一般受众。
- 适用法律使用 `{{GOVERNING_LAW}}` 占位配置；上线前必须替换。
- 联系邮箱。

## 14.6 Accessibility

公开承诺：

```text
We aim to make {{SITE_NAME}} usable with keyboard, touch, pointer, and assistive technology wherever the game format allows. Site navigation, buttons, instructions, and written content should meet WCAG 2.2 AA expectations. Some fast visual games may remain challenging for certain users, so each page explains its controls and provides alternative input where practical.
```

包含：

- 键盘。
- Focus。
- 对比度。
- Reduced motion。
- 无快速闪烁。
- 报告问题邮箱。
- 已知限制不能隐瞒。

## 14.7 404

H1：

```text
Game over — this page is missing.
```

正文：

```text
The link may be outdated, or the game may have moved. Return to the full collection and start a new round.
```

按钮：

```text
Browse all games
Play a random game
```

404 设置 `noindex`.

---

# 15. 安全、性能与工程质量

## 15.1 安全 Header

在 `next.config.ts` 为所有页面配置：

```text
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
X-Frame-Options: SAMEORIGIN
```

- 不设置已废弃的 `X-XSS-Protection`。
- 首发不要直接加入未经真实 AdSense/CMP 测试的严格 CSP，以免误伤广告和 Consent；若添加 CSP，必须先在 Preview 使用 Report-Only 验证并覆盖 Google 官方所需域名。
- 不启用 `Cross-Origin-Opener-Policy` 等可能破坏广告 iframe 的 Header，除非已完整测试。
- 无用户输入写入 HTML，避免 `dangerouslySetInnerHTML`；JSON-LD 使用安全序列化并转义 `<`。
- 依赖必须进行许可证与漏洞审查。
- 不提交密钥。所有 `NEXT_PUBLIC_*` 都视为公开值。

## 15.2 性能预算

面向真实移动设备：

- LCP：≤ 2.5 秒。
- INP：≤ 200 毫秒。
- CLS：≤ 0.1。
- 首页 Lighthouse Performance：目标 ≥ 90。
- 首页 SEO、Accessibility、Best Practices：目标 ≥ 95。
- 游戏页未按 Play 前 Performance：目标 ≥ 85。
- 首页初始 JS：目标 ≤ 180KB gzip。
- 游戏详情在按 Play 前：目标 ≤ 200KB gzip。
- 普通游戏独立 Chunk：目标 ≤ 250KB gzip。
- Matter.js 游戏 Chunk：目标 ≤ 350KB gzip。
- 游戏卡片图：建议 ≤ 160KB。
- OG 图：建议 ≤ 220KB。
- Canvas 游戏在常见中端手机目标 55–60 FPS，最低不能长期低于 30 FPS。

优化措施：

- 点击 Play 后加载游戏。
- 游戏图片本地 WebP。
- 非首屏图片懒加载。
- 不用视频 Hero。
- 粒子对象池。
- 限制 DPR。
- 页面隐藏自动暂停。
- Matter.js 分 Chunk。
- 首页无游戏代码。
- 广告组件预留尺寸。
- 只在需要时加载 AdSense。

## 15.3 浏览器最低目标

根据当前 Next.js 支持范围与实际测试：

- 最新稳定 Chrome。
- 最新稳定 Edge。
- 最新稳定 Firefox。
- Safari 16.4+。
- iOS Safari 与 Android Chrome 的近期版本。

如果某个 API 不支持，提供无崩溃降级：

- Fullscreen 不可用时隐藏按钮。
- AudioContext 失败时静音继续。
- Canvas Context 失败时显示说明和其他游戏链接。
- Pointer Events 为首选，必要时适配 Touch。

---

# 16. 测试方案

## 16.1 测试脚本

`package.json` 至少提供：

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "pnpm validate:catalog && node scripts/generate-ads-txt.mjs && next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "validate:catalog": "node scripts/validate-game-catalog.mjs",
    "optimize:images": "node scripts/optimize-images.mjs"
  }
}
```

安装 `sharp` 供本地图片处理脚本使用。

## 16.2 单元测试

每款游戏把规则与渲染分离。纯逻辑测试至少覆盖：

- 初始状态。
- 合法输入。
- 非法输入。
- 得分。
- 胜利/结束。
- Restart。
- 随机生成约束。
- 关卡完成。
- Undo（适用时）。
- 边界与碰撞。

覆盖率目标：

- `src/games/**/engine`、`rules`、`level` 等纯逻辑：Statements 与 Branches ≥ 85%。
- 不为了覆盖率测试无意义的 Canvas 绘制逐像素细节。
- 任何修复过的规则 Bug 必须新增回归测试。

## 16.3 组件测试

- Header 桌面/移动导航。
- 搜索与分类筛选。
- GameLauncher 点击前不加载引擎。
- Play 后正确加载。
- Pause/Resume/Restart。
- Mute。
- Fullscreen 不支持时降级。
- Error Boundary。
- AdSense 未配置时不加载 Script。
- Preview robots noindex。
- 法律页配置替换。
- Card Link 与 Alt。

## 16.4 E2E 路由测试

Playwright 必须：

- 请求全部公开路由，确认 200。
- 检查 58 个双语游戏 URL 都有本地化且独立的 Title、Description、H1、自引用 Canonical 与互惠语言替代项。
- 确认 Sitemap 包含 58 个游戏 URL，并为每个逻辑页面声明 `en`、`zh-CN` 与 `x-default`。
- 确认 Sitemap 不含 Preview 域名。
- 确认无页面输出 `{{SITE_NAME}}`、`example.com` 或其他生产占位。
- 检查 `/en` 与 `/zh` 首页各自正好有 29 个游戏卡片，并且卡片文案与链接使用当前语言。
- 检查 Header、Footer、Breadcrumb 和相关推荐。
- 检查刷新后游戏回到初始状态。
- 捕获 console error、pageerror、失败网络请求。
- 检查无横向滚动。
- 检查广告位不覆盖游戏或按钮。

## 16.5 每款游戏 Smoke Test

本 Part 对 G01–G20 全部执行；最终测试矩阵还必须覆盖 Part II 的 G21–G29，共 29 款：

1. 打开详情页。
2. 确认引擎未在 Play 前运行。
3. 点击 Play。
4. 执行至少一种有效输入。
5. 确认状态/分数/画面发生预期变化。
6. 点击 Restart，确认回到初始状态。
7. 刷新页面，确认回到 Ready 且无进度。
8. Pause 后模拟时间推进，确认游戏不继续。
9. 切换标签页/触发 `visibilitychange`，确认自动暂停。
10. Unmount/导航离开后确认无残留 RAF 或未清理监听。

各游戏章节中的“关键验收测试”必须作为单元或 E2E 用例落实，而不是只写在文档里。

## 16.6 跨浏览器与视口

Playwright Projects：

- Chromium desktop：1440×900。
- Firefox desktop：1440×900。
- WebKit desktop：1440×900。
- Mobile Chrome：390×844。
- Mobile Safari：390×844。
- Tablet smoke：768×1024。

物理游戏至少在 Chromium、WebKit 各完成一次可重复的固定 Seed Smoke Run。

## 16.7 Accessibility

使用 `@axe-core/playwright` 检查：

- `/en` 与 `/zh` 首页。
- 四个分类各抽查英文与中文页面。
- 一个英文和一个中文 DOM 解谜游戏页。
- 一个 Canvas 街机游戏页。
- 一个 Matter.js 游戏页。
- Solitaire。
- 法律页面。

人工检查：

- 全站 Tab 顺序。
- Skip link。
- 移动菜单焦点陷阱。
- Game Over 焦点。
- 键盘替代。
- 色盲符号。
- Reduced motion。
- 200% Zoom。
- VoiceOver 或 NVDA 至少完成页面导航与开始游戏。

## 16.8 视觉回归

固定 Seed 下生成：

- 首页桌面/手机。
- 游戏详情 Ready 状态。
- GameShell Playing 状态。
- Game Over。
- 分类页。
- 移动菜单。
- Ad placeholder 开发状态。

随机内容截图必须使用固定测试 Seed，避免无意义 Diff。

## 16.9 性能测试

- Lighthouse CI 或等价脚本检查首页和代表性游戏页。
- 分析 Build Bundle，确认任一语言首页都不包含 29 个游戏模块。
- 开始前与开始后分别记录网络资源。
- 运行 10 分钟游戏压力测试，检查内存是否持续增长。
- Canvas Resize 20 次，不得重复绑定监听或创建多个 RAF。
- 广告加载模拟后 CLS 不超过门槛。

---

# 17. 实施顺序

最终版本一次性上线 29 款。本 Part 只列出 G01–G20 的内部实现顺序；完成后必须继续执行 Part II 的 G21–G29 与 Part III 的中文内容，不得在 20 款阶段发布 Production。

## 阶段 A：基础工程

- Next.js 项目、Lint、TypeScript、Tailwind、测试框架。
- Site Config、游戏目录类型与验证。
- Header、Footer、首页、分类页、详情页模板。
- SEO、Sitemap、Robots、JSON-LD。
- GameShell、GameLauncher、Audio、RandomSource。
- 图片目录和 Image Gen 流程。
- Vercel Preview noindex。

完成门槛：G01–G20 的 40 个本地化页面可静态构建，游戏可显示本地化 Ready 占位；这仍只是内部阶段，不得部署为 Production。

## 阶段 B：规则型 DOM 游戏

1. Block Bloom。
2. Number Merge 2048。
3. Color Pour。
4. Unblock Path。
5. Classic Solitaire。
6. Bolt Away。

先建立纯函数测试，再做 UI。

## 阶段 C：轻量 Canvas 游戏

7. Neon Snake。
8. Sky Stack。
9. Zigzag Drift。
10. Tap Hoops。
11. Fruit Slice Rush。
12. Bubble Pop Shooter。

建立统一 Canvas 生命周期和 Pointer 工具。

## 阶段 D：透视与高速游戏

13. Slope Dash。
14. Helix Drop。
15. Tunnel Flux。
16. Wave Rider。
17. Penalty Hero。

重点验证碰撞、可达性、移动触控和性能。

## 阶段 E：关卡/物理游戏

18. Hook Swing。
19. Trap Runner。
20. Rugged Wheels。

Matter.js 只出现在两个指定模块。所有关卡必须原创并通过解算/Smoke 验证。

## 阶段 F：内容、图片、广告和法律页

- 调用所有 `CODEX_IMAGE_GEN_TASK`。
- 优化图片。
- 写入本文完整公开文案。
- 接入 AdSlot，但默认关闭。
- 完成 About、Privacy、Cookies、Terms、Contact、Accessibility。
- 生成 README 和 AGENTS。

## 阶段 G：最终 QA 与部署

- 全测试矩阵。
- 全路由检查。
- Lighthouse。
- 真机桌面/手机检查。
- 版权与占位检查。
- Vercel Preview。
- Production 环境变量。
- 自定义域名与重定向。
- Search Console、Sitemap、AdSense、CMP、ads.txt。

---

# 18. Vercel 部署

## 18.1 Git 与 Vercel

1. 创建 Git 仓库并提交完整源码与 `pnpm-lock.yaml`。
2. 将仓库连接到 Vercel。
3. Framework Preset：Next.js。
4. Node.js：24.x。
5. Install Command：`pnpm install --frozen-lockfile`。
6. Build Command：`pnpm build`。
7. 不覆盖 Output Directory。
8. 设置 Production 与 Preview 环境变量。
9. Preview 构建必须 noindex。
10. Production 成功后绑定正式域名。

也可以使用：

```bash
pnpm dlx vercel
pnpm dlx vercel --prod
```

但长期使用 Git 集成进行 Preview 与 Production Deployment。

## 18.2 环境变量校验

生产构建时：

- `NEXT_PUBLIC_SITE_URL` 必须是有效 HTTPS 绝对 URL。
- `NEXT_PUBLIC_CONTACT_EMAIL` 不得是 `example.com`。
- `NEXT_PUBLIC_LEGAL_NAME` 非空。
- `{{GOVERNING_LAW}}` 必须已替换。
- 开启 AdSense 时 Client、Publisher、Slot 必须完整。
- 未开启 AdSense 时允许广告变量为空。

Preview：

- Canonical 仍指向生产域名。
- Robots 为 noindex。
- 不加载真实 AdSense，即使 Preview 继承了变量；代码必须额外检查 `VERCEL_ENV === "production"`。

## 18.3 域名

- 在 Vercel 添加根域名与 `www`。
- 选择一个 Production Domain。
- 另一个使用 Vercel Redirect。
- HTTPS 生效。
- 测试：
  - HTTP → HTTPS。
  - 非 Canonical → Canonical。
  - `/sitemap.xml`。
  - `/robots.txt`。
  - `/ads.txt`。
  - 58 个双语游戏路径。
  - 404。

## 18.4 上线后搜索配置

- Google Search Console 验证域名。
- 提交 `https://DOMAIN/sitemap.xml`。
- 抽检首页、分类页和 5 个游戏页 URL Inspection。
- 确认 HTML 中可见正文和 Canonical。
- 可选接入 Bing Webmaster Tools，并提交同一 Sitemap。
- 不在上线当天批量创建低质量外链或自动流量。

## 18.5 AdSense 上线

- 先以关闭广告的完整网站部署。
- 添加站点到 AdSense。
- 放置站点验证代码。
- 审核通过后设置 Client/Slot/Publisher。
- 配置 Google CMP。
- 生成并验证 ads.txt。
- 打开 `NEXT_PUBLIC_ENABLE_ADSENSE=true`。
- 用不点击广告的方式检查桌面/手机布局。
- 监控 unfilled、CLS、误触风险和 Confirmed Click 提示。
- 不购买机器人流量，不自行反复刷新广告，不鼓励用户点击。

---

# 19. README 与 AGENTS 要求

## 19.1 README

必须包含：

- 项目简介。
- 29 款游戏的中英文名称、逻辑 Slug 与双语路由说明。
- 技术栈。
- 本地启动。
- 环境变量。
- 测试命令。
- 图片生成与优化。
- 如何添加新的第 30 款游戏，并同时补齐 `en`、`zh`、Metadata、Sitemap、图片和测试。
- AdSense 开关与 ads.txt。
- Vercel 部署。
- 无数据库、无存档的状态规则。
- 版权与素材原则。

## 19.2 AGENTS.md

给后续 Codex/Agent 的不可变规则：

- 不添加数据库与账户。
- 不保存游戏状态。
- 不把游戏模块打进首页。
- 不复制第三方游戏素材。
- 新增游戏必须有独立 SEO、正文、图片和测试。
- 修改共享 Engine 前运行全部游戏测试。
- 广告不得靠近游戏控件或自动刷新。
- 所有 Production 变更必须通过 `pnpm build` 和 Playwright。

---

# 20. G01–G20 阶段验收补充（最终验收以 Part 0 §0.18 为准）

## 内容与功能

- [ ] `/en` 与 `/zh` 首页文案完整，并各展示最终 29 张卡片。
- [ ] G01–G20 在两种语言页中都可玩且不是 Demo 占位；最终还必须完成 G21–G29。
- [ ] Puzzle、Arcade、Skill、Brain 四个分类均有中英文页面。
- [ ] About、Privacy、Cookies、Terms、Contact、Accessibility 完整。
- [ ] 404 完整。
- [ ] 所有封面原创、已压缩、无水印。
- [ ] 无第三方商标、角色、球队和复制关卡。
- [ ] 刷新任一游戏后从头开始。
- [ ] 无 Local/Session Storage、IndexedDB、游戏 Cookie 和 API。

## SEO

- [ ] G01–G20 的 20 个英文 Title、Description、H1 在英文集合内唯一。
- [ ] G01–G20 的 20 个中文 Title、Description、H1 在中文集合内唯一。
- [ ] 两种语言文案不是互相复制，也不存在英语正文套中文页面。
- [ ] 40 个 G01–G20 本地化页面均为自引用 Canonical，并具有互惠 `hreflang`。
- [ ] 最终 Sitemap 按 Part 0 覆盖全部 58 个游戏 URL。
- [ ] Robots 正确。
- [ ] Preview noindex。
- [ ] OG 图片可抓取。
- [ ] JSON-LD 无假评分。
- [ ] 页面 HTML 有正文，不依赖 Canvas。
- [ ] 内部链接可抓取。

## 广告与合规

- [ ] 广告默认关闭。
- [ ] 广告只在 Production 且配置完整时加载。
- [ ] 游戏交互区与广告明显分离。
- [ ] 无广告自动刷新。
- [ ] 无误导标签。
- [ ] ads.txt 与 AdSense 一致。
- [ ] CMP 已配置。
- [ ] Privacy/Cookie URL 已提供给 CMP。
- [ ] 未点击自己的广告。

## 工程

- [ ] TypeScript Strict。
- [ ] Lint 通过。
- [ ] Unit 通过。
- [ ] E2E 通过。
- [ ] Build 通过。
- [ ] 29 个游戏模块均按需加载，且任一语言首页初始 Bundle 不包含玩法引擎。
- [ ] Matter.js 只在两个游戏 Chunk。
- [ ] 无 Console Error。
- [ ] 无持续内存增长。
- [ ] 移动端无横向溢出。
- [ ] 键盘、Touch、Pointer 基本可用。

## 部署

- [ ] Vercel Production 成功。
- [ ] 正式域名与 HTTPS 生效。
- [ ] www/根域统一。
- [ ] `/robots.txt`、`/sitemap.xml`、`/ads.txt` 可访问。
- [ ] Search Console 验证并提交 Sitemap。
- [ ] 真实桌面与手机检查完成。
- [ ] 生产页面无占位变量。

---

# 21. 官方参考资料

实施时以最新官方文档为准；本文引用的关键资料如下：

## Next.js 与 Vercel

- Next.js Docs（当前文档显示 16.3.0）：  
  https://nextjs.org/docs
- Installation 与 Node.js 要求：  
  https://nextjs.org/docs/app/getting-started/installation
- Metadata：  
  https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- Sitemap 文件约定：  
  https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
- Robots 文件约定：  
  https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
- Lazy Loading：  
  https://nextjs.org/docs/app/guides/lazy-loading
- Static Exports（参考，不作为本项目强制模式）：  
  https://nextjs.org/docs/app/guides/static-exports
- Next.js on Vercel：  
  https://vercel.com/docs/frameworks/full-stack/nextjs
- Vercel Deployments：  
  https://vercel.com/docs/deployments
- Vercel Node.js Versions：  
  https://vercel.com/docs/functions/runtimes/node-js/node-js-versions

## Google Search

- SEO Starter Guide：  
  https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Title links：  
  https://developers.google.com/search/docs/appearance/title-link
- Meta descriptions/snippets：  
  https://developers.google.com/search/docs/appearance/snippet
- Canonical：  
  https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Sitemaps：  
  https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
- Image SEO：  
  https://developers.google.com/search/docs/appearance/google-images
- Structured data introduction：  
  https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
- Structured data guidelines：  
  https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- Software app structured data（说明评分要求与 VideoGame 限制）：  
  https://developers.google.com/search/docs/appearance/structured-data/software-app
- Google 支持的 Meta 标签（包含 meta keywords 不被使用）：  
  https://developers.google.com/search/docs/crawling-indexing/special-tags

## Google AdSense

- Ad placement policies：  
  https://support.google.com/adsense/answer/1346295
- Ads on game play pages：  
  https://support.google.com/adsense/answer/2768340
- Ads.txt guide：  
  https://support.google.com/adsense/answer/12171612
- Google CMP：  
  https://support.google.com/adsense/answer/16918505
- Set up/manage CMP：  
  https://support.google.com/adsense/answer/7670013
- IAB Europe TCF integration：  
  https://support.google.com/adsense/answer/9804260

## 性能

- Core Web Vitals：  
  https://web.dev/articles/vitals

---

# 22. 交付声明

Codex 完成项目后，必须在最终回复中报告：

1. 项目根目录。
2. 已实现的 29 款游戏，以及 58 个中英文游戏 URL。
3. 已生成的图片清单。
4. 测试命令与通过结果。
5. Production Build 结果。
6. Vercel Preview/Production URL（如果拥有部署权限）。
7. 尚需站点所有者填写的域名、联系邮箱、法律信息和 AdSense 配置。
8. 任何未达到本文门槛的项目，必须明确列出，不能用“已完成”掩盖。

本规格的核心原则升级为：**29 款原创单人游戏、中英文双语、纯前端、无数据库、无游戏存储、刷新重置、两种语言 SEO 正文均可抓取、广告远离交互区、可直接部署到 Vercel。**

---

# Part II：G21–G29 Garden Logic 机制与英文内容（扩展阶段规格）

# Garden Logic Pack：G21–G29 玩法研究、英文内容与工程细则

> 文档用途：本 Part 在同一主规格中为 G01–G20 增加 G21–G29，并同步完成双语首页、导航、分类、集合页、SEO、图片、广告布局、测试和 Vercel 上线。Codex 不需要寻找另一份外部规格文件。  
> 本文件也包含必要的独立实施约束；即使 Codex 只收到这一份文件，也不得把工作降级为原型或只实现部分游戏。  
> 调研日期：2026-08-11。  
> 调研对象：Gamesaien 首页及其公开玩法说明页。  
> 扩展后首发总量：29 款游戏，其中本文件新增 `G21–G29` 共 9 款。  
> 公开页面首发语言：英文与简体中文；本 Part 中的公开文案作为英文版本，中文版本见 Part III。
> **阶段覆盖说明：** 本 Part 中“新增 9 个路由”等表述均指 9 个逻辑游戏。最终必须在 `/en` 与 `/zh` 下分别生成页面，因此新增 18 个可索引游戏 URL；合并全部 29 个逻辑游戏后共有 58 个双语游戏 URL。任何无 Locale 前缀的示例都只代表逻辑路径后缀。

---

## 0. 给 Codex 的执行指令

1. 先阅读 Part 0 与 Part I，再阅读本 Part 和 Part III；若存在冲突，按文档首页定义的优先级执行。
2. 直接修改现有项目并交付可运行代码，不要只输出分析、线框图、伪代码、组件片段或 TODO。
3. 新增 9 款游戏全部属于首发上线范围，不能标记为 `Coming soon`，不能用静态图片冒充可玩游戏。
4. 保留 G01–G20 的玩法、英文内容、中文内容、40 个本地化 URL 与测试；本次工作不能造成回归。
5. 所有新游戏继续遵循：单人、纯前端、无数据库、无登录、无 API、无云存档、刷新后完全重置。
6. 不使用 `localStorage`、`sessionStorage`、IndexedDB、Cookie、URL 参数或服务端请求保存任何游戏状态、分数、设置、题目或进度。
7. 本文标记为 `CODEX_IMAGE_GEN_TASK` 的图片，调用已安装的 Image Gen skill 一次性生成完整画面；不要从 Gamesaien 或其他游戏站下载、截图、临摹或热链素材。
8. 新游戏可以借鉴通用的玩法机制，但名称、代码、棋盘数据、计分、时间、UI、美术、音效、动画和页面文案必须原创。
9. 完成每个实施阶段后运行相关单元测试、E2E、类型检查和生产构建；最终必须通过本文件的全部验收清单。
10. 最终提交应同时更新 `README.md`、`AGENTS.md`、游戏目录、Sitemap、图片清单、测试清单和 Vercel 部署说明。

---

# 1. 调研结论与选型范围

## 1.1 Gamesaien 页面观察

Gamesaien 首页将自己描述为无需下载即可游玩的免费 HTML5 游戏站，核心内容以轻量拼图和脑力训练为主。首页直接列出 9 个独立玩法，另外把地图问答放在单独的“地图测验专区”。本扩展选择首页 9 个明确命名的核心游戏机制，不把地图专区混入本批次，以避免把“单一小游戏”与“地理题库集合”混成同一实施范围。

原站的高价值特征不是视觉样式，而是以下产品模式：

- 规则能在一两句话内解释。
- 单局短、刷新即可重新开始。
- 数学、颜色、空间与路径判断构成主要挑战。
- HTML5 浏览器直接运行，不依赖下载。
- 多数玩法适合鼠标拖拽，也可以重新设计成触摸和键盘可用。
- 页面除游戏外提供简洁说明，具备可索引文字内容。

## 1.2 玩法研究映射

| Gamesaien 公开玩法 | 调研到的核心规则 | 本项目原创实现 | 关键差异 |
|---|---|---|---|
| フルーツボックス | 框选数字总和达到目标 | **Sum Orchard** | 目标、棋盘、时间、计分、生成算法与美术全部重做 |
| カラータイル | 点击空位，检查上下左右最近颜色 | **Color Cross** | 明确采用对轴配对规则，并使用颜色+符号双编码 |
| メッシュボード | 直线移动球，形成同色直线 | **Orbit Lines** | 新的阻挡规则、棋盘大小、计分和重排机制 |
| エル字星座 | 选 3 个同色星形成 L 形 | **Corner Stars** | 使用整数向量几何、等臂规则和原创星图 |
| よこよこDrop | 横向移动后下落并形成同色组 | **Sidefall Blocks** | 只移动列顶块，加入连锁消除和原创堆栈系统 |
| 三色玉 | 框选三种颜色的完整组合 | **Triad Capture** | 允许 1–4 组等量符号并进行重力补充 |
| セイムエンド | 相同端点，中间为同一种颜色的路径 | **Echo Path** | 使用正交路径、永久占用和反向生成关卡 |
| フルーツカート | 选择两数，使和等于目标 | **Target Basket** | 12 回合、独立计时、原创分数与可访问输入 |
| フルーツ25ます計算 | 完成 25 格加减乘计算 | **Math Grid Sprint** | 新的模式流程、错误反馈、倒计分与移动端键盘 |

## 1.3 调研事实与原创边界

调研只用于理解玩法类别和用户交互，不允许 Codex：

- 复制原站日文或英文名称。
- 复制页面布局、Logo、字体、按钮、配色或装饰。
- 抓取任何图片、音频、脚本、关卡或题目数据。
- 复刻原站的完整计分表、时间配置和提示文字。
- 在生产页面宣称与 Gamesaien 存在授权、合作或官方关系。
- 把来源网站名称放入公开 SEO Title、H1、Meta description 或图片 Alt。

可以在项目内部的研究记录中保留来源链接，但公开游戏页必须以独立原创产品呈现。

---

# 2. 项目目标与不可变约束

## 2.1 本次扩展目标

在既有 ArcadeMint 网站中增加一个名为 **Garden Logic** 的益智集合，以 9 款规则轻量、无后端依赖的原创游戏补足数学、空间和逻辑内容。扩展完成后：

- `/en` 与 `/zh` 首页各展示全部 29 款游戏。
- `/en/collections/garden-logic` 与 `/zh/collections/garden-logic` 分别展示本批次 9 款游戏，并拥有对应语言的独立 SEO 正文。
- G21–G29 在两种语言下生成 18 个游戏 URL，全部静态预渲染并可直接游玩。
- 新增 `Brain` / `脑力` 导航与双语分类入口，但不删除现有 Puzzle、Arcade、Skill。
- Sitemap、相关推荐、图片、JSON-LD、测试和部署覆盖 29 个逻辑游戏与 58 个双语游戏 URL。

## 2.2 强制技术约束

- 只做单人游戏。
- 不创建数据库、用户系统、排行榜、评论、成就、支付或订阅。
- 不创建 API Route、Server Action、WebSocket、自建后端或边缘函数来运行游戏逻辑。
- 页面首次返回的 HTML 必须包含 H1、简介、玩法、技巧和 FAQ；游戏 Canvas/客户端组件不能成为页面唯一内容。
- 游戏状态只存在于当前页面内存；刷新后题目、棋盘、计时、分数、模式、设置和 Undo 全部丢失。
- 关卡或题目生成不访问远程 API。
- 所有游戏同时支持桌面与移动浏览器，并提供键盘可操作路径。
- 不以颜色作为唯一信息载体。
- 不自动播放有声内容；音效默认关闭或在用户第一次明确交互后启用。
- 不把广告放进游戏棋盘、Canvas、计时栏、开始按钮、结果弹层或触控热区。

## 2.3 完成定义

只有以下项目全部成立才算完成：

- 游戏目录恰好包含 G01–G20 与 G21–G29，共 29 个唯一 Slug；每个 Slug 同时包含 `en` 与 `zh`。
- 9 个新游戏均能开始、进行、结束和重新开始。
- 9 个新游戏的刷新行为通过自动测试，且浏览器存储扫描为空。
- 中英文首页、Brain 分类页、Garden Logic 集合页以及 G21–G29 的 18 个本地化游戏页均可索引。
- 新增图片全部由 Image Gen skill 生成并本地优化。
- `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm test:e2e`、`pnpm build` 全部通过。
- Vercel Preview 与 Production 部署均成功，Preview 不进入搜索索引。
- 生产页面无假评分、假评论、虚假玩家数量、空白卡片和未实现占位符。

## 2.4 技术基线

如果现有仓库已经按上一份规格建立，保持其稳定依赖与目录，不为了本扩展进行无关的大版本迁移。如果 Codex 从空仓库开始，使用以下基线：

- Next.js 当前稳定版，App Router。
- React 与 Next.js 对应稳定版本。
- Node.js 当前 Active LTS 主版本，并在 `.nvmrc` 与 `package.json#engines` 固定。
- TypeScript `strict: true`。
- Tailwind CSS。
- pnpm 并提交锁文件。
- Vitest + Testing Library。
- Playwright + `@axe-core/playwright`。
- Lucide React 仅用于通用 UI 图标。
- 不引入 Phaser、Three.js、数据库 SDK、认证 SDK 或全局状态框架。

渲染要求：

- Layout、首页、分类页、集合页和游戏 SEO 正文使用 Server Components。
- 游戏运行区与筛选器使用 Client Components。
- `/{locale}/games/[slug]` 通过 `generateStaticParams()` 静态生成 29 × 2 = 58 个游戏路由。
- `generateMetadata()` 从静态游戏目录读取数据。
- 不调用 `cookies()`、`headers()` 或运行时远程 `fetch()` 来生成公开内容页。
- 不强制 `output: "export"`，但构建分析中所有内容路由必须静态预渲染，不能因本扩展产生业务 Serverless Function。
- 本地封面声明固定尺寸；游戏代码只在点击 Play 后加载。

---

# 3. G01–G20 与 G21–G29 的统一合并方案

## 3.1 游戏编号与目录

新增目录：

```text
src/games/
├─ sum-orchard/          # G21
├─ color-cross/          # G22
├─ orbit-lines/          # G23
├─ corner-stars/         # G24
├─ sidefall-blocks/      # G25
├─ triad-capture/        # G26
├─ echo-path/            # G27
├─ target-basket/        # G28
└─ math-grid-sprint/     # G29
```

每个目录至少包含：

```text
<game>/
├─ index.ts
├─ Game.tsx
├─ engine.ts
├─ types.ts
├─ constants.ts
├─ generation.ts         # 有随机棋盘/题目时
├─ accessibility.ts      # 需要专门播报时
└─ __tests__/
   ├─ engine.test.ts
   └─ generation.test.ts
```

不要把九款游戏写进一个巨大的共享组件。共享的矩形选择、计时、随机数、结果弹层和键盘焦点工具放入 `src/games/shared/`，但每个游戏的规则函数保持独立。

## 3.2 更新游戏目录类型

原 `GameCategory` 扩展为：

```ts
export type GameCategory = "puzzle" | "arcade" | "skill" | "brain";
```

`brain` 表示数学、逻辑、空间和模式识别。一个游戏可以同时属于 `brain` 与 `puzzle` 或 `skill`。

游戏数据继续只存于静态 TypeScript 内容目录。构建校验更新为：

- 游戏总数为 29，每个 Slug 唯一。
- 新增 Slug 恰好为本文九个 Slug。
- 每个新游戏都包含完整 `en` 与 `zh`，缺少任一语言时构建失败。
- 英文与中文各自的 SEO Title、Meta description、H1 和卡片文案在本语言集合内唯一；中英文不能完全相同。
- 每款游戏至少 3 条 How to play、3 条 Tips、4 个 FAQ、4 个有效相关推荐，并在当前 Locale 解析名称与链接。
- 相关推荐不能指向自己，且对应的 18 个本地化路由必须存在。
- 每款本地封面和 OG 图片必须存在；英文和中文图片 Alt 均非空。

## 3.3 游戏注册器

在 `src/lib/game-registry.ts` 增加静态动态导入映射：

```ts
export const gameLoaders = {
  // existing G01-G20 loaders...
  "sum-orchard": () => import("@/games/sum-orchard"),
  "color-cross": () => import("@/games/color-cross"),
  "orbit-lines": () => import("@/games/orbit-lines"),
  "corner-stars": () => import("@/games/corner-stars"),
  "sidefall-blocks": () => import("@/games/sidefall-blocks"),
  "triad-capture": () => import("@/games/triad-capture"),
  "echo-path": () => import("@/games/echo-path"),
  "target-basket": () => import("@/games/target-basket"),
  "math-grid-sprint": () => import("@/games/math-grid-sprint"),
} as const;
```

要求：

- 首页和集合页只加载卡片与本地图片，不加载九款游戏运行代码。
- 游戏模块在点击 `Play` 后才动态加载。
- 注册器必须有类型测试，确保 29 个目录 Slug 与 29 个 Loader 完全一致。
- 不通过任意字符串拼接动态 import，以免构建器无法建立稳定 Chunk。

## 3.4 无存储保障

添加一个工程级防回归测试，扫描 `src/games`、`src/components/game` 和 `src/app/[locale]/games`：

```text
localStorage
sessionStorage
indexedDB
document.cookie
/api/
fetch(
XMLHttpRequest
WebSocket
```

允许站点级 CMP 或 AdSense 脚本按合规需要使用 Cookie，但游戏代码不得读写这些数据，也不得根据 Cookie 恢复游戏状态。

---

# 4. 共用游戏运行框架

## 4.1 `GameShell` 扩展

沿用原项目 `GameShell`，新增可选能力：

```ts
interface GameShellProps {
  slug: string;
  title: string;
  instructions: string;
  orientation?: "portrait" | "landscape" | "either";
  supportsKeyboard: boolean;
  timerMode?: "countdown" | "countup" | "none";
  onStart: () => void;
  onRestart: () => void;
  onPause?: () => void;
}
```

`GameShell` 必须统一提供：

- 明确的 Play 按钮。
- 当前分数、时间、状态和必要的次级指标。
- Restart 按钮。
- 本局有效的 Sound 与 High Contrast 控件。
- 可访问的操作说明。
- 游戏加载失败后的重试 UI。
- `prefers-reduced-motion` 支持。
- 页面隐藏时暂停计时和动画；恢复时继续，不补算后台时间。

## 4.2 状态机

所有新游戏至少使用以下状态：

```ts
type GamePhase = "idle" | "playing" | "resolving" | "paused" | "finished";
```

禁止使用散乱布尔值表达互斥阶段。所有输入仅在 `playing` 状态生效，动画期间进入 `resolving`，防止重复提交。

## 4.3 时间与生命周期

- 使用基于 `performance.now()` 的时间差计算，不依赖每秒正好触发一次的 `setInterval`。
- UI 更新可使用 100–250ms Tick，但实际剩余时间从基准时间计算。
- `visibilitychange` 时记录暂停点；恢复后平移基准时间。
- `requestAnimationFrame`、Timeout、Interval、Pointer Capture 和事件监听器必须在 Restart 和 Unmount 时清理。
- Strict Mode 下不得产生双计时器或双初始化棋盘。

## 4.4 随机数与可测试性

生产环境：

- 每次点击 Play 或 Restart 在内存中生成新 Seed。
- 使用 `crypto.getRandomValues()` 创建 Seed。
- 不把 Seed写入 URL、DOM data 属性、Storage 或服务端日志。

测试环境：

- Engine/Generator 接收 `RandomSource` 接口。
- 使用确定性 Seed 复现边界棋盘。
- 属性测试至少执行 1,000 个 Seed 的生成验证；不能依赖“多试几次通常能成功”。

## 4.5 共用矩形选择工具

`Sum Orchard` 与 `Triad Capture` 共用：

- 指针起点与当前点到行列索引的映射。
- 选区边界标准化。
- 拖出棋盘后的 Clamp。
- 触摸滚动抑制只限于激活的游戏区域。
- 键盘 Anchor/Extend 模式。

共享工具只负责选区，不包含任何具体游戏的求和或计数逻辑。

## 4.6 可访问性底线

- 所有颜色元素同时包含形状、纹理、字母或图标差异。
- 可操作单元最小触控区域 44×44 CSS px。
- 键盘焦点清晰，不能被 Canvas 或自定义 Outline 隐藏。
- 实时播报只宣布关键结果，不逐帧朗读拖拽过程。
- 计时剩余 30、10、5 秒时提供简短非干扰播报。
- 高对比模式只在当前会话内生效，刷新重置。
- Reduced Motion 下移除震动、弹跳和长距离粒子动画，保留必要状态变化。

---

# 5. Garden Logic 视觉与设计系统

## 5.1 视觉方向

保持 ArcadeMint 原有深色现代街机基线，同时为本集合加入“数字花园”辨识度：

- 深蓝黑背景，不使用原站白底旧式网页视觉。
- 植物、星图、果实、符号和几何线条只作为原创抽象主题。
- 重点色使用薄荷绿、杏橙、柔紫与金黄。
- 游戏棋盘保持高对比、低噪音；装饰不能干扰数字或符号识别。
- 卡片封面统一采用高级 3D/2.5D 插画，不在图片中绘制标题文字。
- UI 不仿照 Gamesaien 的 Logo、页头、边框或图标。

## 5.2 新增设计 Token

在现有 Token 上增加：

```css
--garden-mint: #82f0c4;
--garden-lime: #c5f36a;
--garden-apricot: #ffb56b;
--garden-gold: #ffd978;
--garden-violet: #b7a0ff;
--garden-panel: #121c2c;
--garden-grid: #26344a;
--garden-danger: #ff7d83;
--garden-focus: #f9f871;
```

实际颜色可微调以满足 WCAG 对比度，但必须同步更新视觉回归基线。不要在游戏逻辑中直接写散落的十六进制颜色。

## 5.3 游戏布局

桌面：

- 游戏内容最大宽度 920px。
- 棋盘居中，右侧可放说明或状态面板，但广告不得占据该区域。
- 结果层覆盖 `GameShell` 内部非广告区域。

移动：

- 单列布局。
- 状态栏固定在棋盘上方，而不是盖住棋盘。
- 触摸游戏阻止页面滚动的范围只能是正在拖拽的棋盘。
- 横屏不是强制条件；所有九款都应支持常规手机竖屏。

## 5.4 集合封面生成

```text
CODEX_IMAGE_GEN_TASK
Output source: public/images/collections/garden-logic/source.png
Final card: public/images/collections/garden-logic/cover.webp (1200×675)
Final social: public/images/collections/garden-logic/og.webp (1200×630)
Prompt:
An original premium browser puzzle collection scene: a dark digital garden combining numbered fruit tokens, geometric stars, colored runes, glowing path tiles and a small arithmetic grid, cohesive elegant 3D composition, deep navy background with mint, apricot and violet lighting, ample negative space, no text, no logo, no watermark, no recognizable third-party game art.
Post-process:
Preserve every puzzle motif in both crops, convert to WebP quality 82, keep each final file below 180 KB when possible without visible degradation.
```

---

# 6. 信息架构、导航与首页更新

## 6.1 新增双语路由

下列逻辑路径全部在 `en` 与 `zh` 下生成，共 22 个新增可索引 URL：

```text
/{locale}/collections/garden-logic
/{locale}/category/brain
/{locale}/games/sum-orchard
/{locale}/games/color-cross
/{locale}/games/orbit-lines
/{locale}/games/corner-stars
/{locale}/games/sidefall-blocks
/{locale}/games/triad-capture
/{locale}/games/echo-path
/{locale}/games/target-basket
/{locale}/games/math-grid-sprint
```

所有路由在构建时静态生成并返回 200。不存在的 Locale 或 Slug 返回当前路由树的自定义 404，不能静默回首页或返回英文 200 页面。

## 6.2 Header 导航

桌面与移动导航都从 Part 0 的 Locale 字典读取：

```text
English: Games · Puzzle · Arcade · Skill · Brain · About · Random game
中文: 全部游戏 · 益智 · 街机 · 技巧 · 脑力 · 关于 · 随机游戏
```

- `Games` / `全部游戏` 指向 `/{locale}#games`，本项目不创建重复的 `/games` 聚合页。
- `Brain` / `脑力` 指向 `/{locale}/category/brain`。
- `Garden Logic` / `花园逻辑` 通过首页集合卡和 Brain 分类页进入，不额外挤占一级导航。
- 语言切换器保持当前逻辑路径；移动菜单中的标签、`aria-label` 和焦点提示也必须本地化。

## 6.3 英文首页内容源更新（中文首页见 Part 0 §0.11）

把原先写死的“20”改为不依赖数量的文案：

```text
Title:
Free Online Mini Games – Play Instantly | {{SITE_NAME}}

Meta description:
Play original browser games with no download or sign-up. Enjoy puzzles, brain games, arcade challenges, sports, and skill games on desktop or mobile.

H1:
Free Browser Games. No Sign-Up. Just Play.

Eyebrow:
ORIGINAL BROWSER GAMES
```

旧阶段的首页数量标题改为从目录长度和当前 Locale 生成：

```tsx
<h2>All {games.length} games</h2>
```

英文构建显示自然的 `All 29 games`，中文构建显示等义中文文案；数量从目录计算，不在 Metadata 或组件中重复硬编码。

首页 Hero 正文更新为：

```text
Pick a brain puzzle, arcade challenge, sports round, or physics course and start in seconds. Every game runs in your browser on desktop or mobile.
```

首页介绍正文更新为：

```text
ArcadeMint is a focused collection of original browser games made for quick breaks, relaxed problem solving, and score chasing. There are no downloads, accounts, profiles, or cloud saves. Choose a game, press Play, and the interactive module loads only when you are ready.

The collection includes number puzzles, geometry challenges, path games, block and color logic, one-button arcade runs, sports rounds, physics levels, and classic solitaire. Game progress stays only in the open page. Refreshing starts a new board, run, deal, or level one.
```

## 6.4 首页新增双语 Garden Logic 区块

在原 `Featured` 与第一个广告位之后插入，并从当前 Locale 读取以下内容：

```text
English title: Garden Logic
English copy: Nine original number, color, shape, and path puzzles built for quick thinking. Every board runs locally in your browser and starts fresh when you refresh.

中文标题: 花园逻辑
中文文案: 九款原创数字、颜色、形状与路径谜题，规则清晰，打开即玩。所有棋盘都在浏览器本地运行，刷新后重新开始。
```

展示顺序：

1. Sum Orchard
2. Color Cross
3. Orbit Lines
4. Corner Stars
5. Sidefall Blocks
6. Triad Capture
7. Echo Path
8. Target Basket
9. Math Grid Sprint

区块末尾按钮按 Locale 输出：

```text
English: Explore Garden Logic
中文: 探索花园逻辑
```

按钮指向 `/{locale}/collections/garden-logic`。

## 6.5 首页双语筛选

筛选 Chips 由 Locale 字典输出：

```text
English: All · Puzzle · Arcade · Skill · Brain
中文: 全部 · 益智 · 街机 · 技巧 · 脑力
```

筛选仅改变当前 DOM 显示，不修改 URL，不产生可索引搜索参数。搜索时匹配名称、卡片文案和分类，但不能加载游戏 Chunk。

## 6.6 Brain 分类页英文 SEO 内容源（中文版本见 Part 0 §0.12）

```text
Logical route suffix:
/category/brain

Title:
Free Brain Games Online – Logic & Math Puzzles | {{SITE_NAME}}

Meta description:
Play free browser brain games about numbers, patterns, geometry, paths, and quick calculation. No download, account, or saved progress required.

H1:
Free Brain Games Online

Intro:
Train number sense, spatial reasoning, pattern recognition, and planning with original browser puzzles that start instantly and reset when you refresh.
```

Brain 页面从目录筛选所有带 `brain` 分类的游戏，并保证至少包含本文件九款。页面不得伪造“训练智商”“改善疾病”“提高考试成绩”等无法证明的效果。

## 6.7 Garden Logic 集合页英文 SEO 内容源（中文版本见 Part 0 §0.12）

```text
Logical route suffix:
/collections/garden-logic

Title:
Free Brain Games & Logic Puzzles Online | {{SITE_NAME}}

Meta description:
Play nine original number, color, geometry, path, and math puzzles directly in your browser. No download, account, or saved progress required.

H1:
Garden Logic: Free Brain Games Online

Intro:
Garden Logic is a focused set of original browser puzzles about numbers, colors, geometry, paths, and quick calculation. Each game opens instantly, keeps its state only in the current page, and starts fresh after a refresh.
```

集合页区块：

1. Breadcrumb。
2. Hero 与集合封面。
3. 9 张卡片。
4. `What you will practice`：Number sense、Pattern recognition、Spatial reasoning、Planning。
5. `How these games work` 正文。
6. 集合 FAQ。
7. 相关集合或分类。
8. Footer。

## 6.8 集合页英文公开正文（中文正文见 Part 0）

```text
These games are designed around compact rules rather than long tutorials. Some ask you to find a total inside a grid, while others turn empty space, straight lines, right angles, or matching endpoints into the main puzzle. Short timers make several games feel energetic, but every result comes from clear rules that can be learned in one round.

No account or cloud save is used. A score, board, selected mode, and temporary accessibility setting stay only in the open page. Refreshing creates a new run, which makes the collection suitable for quick breaks rather than long progression systems.
```

## 6.9 集合页英文 FAQ（中文 FAQ 见 Part 0）

```text
Q: Are these games copied from Gamesaien?
A: No. The collection was informed by familiar puzzle mechanics, but every public name, rule implementation, score system, visual, board generator, interface, image, and page text is original.

Q: Do the brain games save progress?
A: No. Each game keeps temporary state only while its page remains open.

Q: Can I play with touch controls?
A: Yes. Every game supports phones and tablets, and each one also has a keyboard path.

Q: Are colors the only way to understand the pieces?
A: No. Color-based games pair colors with symbols or shapes and include high-contrast presentation.

Q: Do I need to download anything?
A: No. The games run directly in a supported browser.
```

---

# 7. 游戏详情页共用结构

每个新增游戏页按以下顺序渲染：

1. Breadcrumb 按 Locale 输出：英文 `Home → Brain Games → Game Name`；中文 `首页 → 脑力游戏 → 中文游戏名`。
2. H1。
3. 一句独立简介。
4. 游戏壳与明显的 Play 按钮。
5. 游戏下方操作摘要。
6. 可选广告位 `game-below-play`，与最后一个游戏控件保持充分距离。
7. 本地化 `About {Game}` / `关于{中文游戏名}`。
8. 本地化 `How to play` / `玩法说明`。
9. 本地化 `Tips` / `游戏技巧`。
10. FAQ。
11. 本地化 `Related games` / `相关推荐`，名称与链接保持当前 Locale。
12. 可选广告位 `game-content-end`。
13. Footer。

游戏正文必须作为 Server Component 输出。游戏运行组件使用 Client Component，并在 Play 后动态导入。

## 7.1 广告安全要求

- 游戏棋盘、拖拽区域、虚拟数字键盘、Start、Restart、Shuffle 和结果按钮周围不放广告。
- 广告不能在游戏运行后自动刷新。
- 不能用 `Continue`、`Next`, `Hint` 或其他游戏按钮诱导广告点击。
- 移动端广告不能固定遮挡棋盘或造成布局位移。
- 没有有效 Publisher ID 与 Slot ID 时，广告组件不渲染空白容器。
- 使用清晰的 `Advertisement` 标签，但不采用“Support us”“Click here”等诱导文字。

## 7.2 SEO 技术要求

每个游戏页包含：

- 当前语言独立且唯一的 Title、Meta description、H1 与自引用 Canonical。
- Open Graph 1200×630 图片。
- `WebPage`、`BreadcrumbList` 与诚实的 `VideoGame` JSON-LD。
- `gamePlatform: "Web browser"`。
- `playMode: "SinglePlayer"`。
- `isAccessibleForFree: true`。
- 默认可见的 About 与 How to play 正文。
- 图片 Alt 描述实际画面，不堆砌关键词。
- 不使用 `meta keywords`。
- 不添加不存在的评分、评论、获奖、玩家量或发布日期。

---

# 8. 新增 9 款游戏目录

| ID | 游戏 | Route | 主分类 | 交互 | 主要技术 |
|---|---|---|---|---|---|
| G21 | Sum Orchard | `/games/sum-orchard` | Brain / Puzzle | 框选数字 | React + CSS Grid |
| G22 | Color Cross | `/games/color-cross` | Brain / Puzzle | 点击空位 | React + CSS Grid |
| G23 | Orbit Lines | `/games/orbit-lines` | Brain / Puzzle | 直线移球 | DOM + SVG |
| G24 | Corner Stars | `/games/corner-stars` | Brain / Puzzle | 选点几何 | SVG |
| G25 | Sidefall Blocks | `/games/sidefall-blocks` | Puzzle / Skill | 横移与下落 | React + CSS Grid |
| G26 | Triad Capture | `/games/triad-capture` | Brain / Puzzle | 框选等量符号 | React + CSS Grid |
| G27 | Echo Path | `/games/echo-path` | Brain / Puzzle | 正交连线 | DOM + SVG Overlay |
| G28 | Target Basket | `/games/target-basket` | Brain / Skill | 两数配对 | React DOM |
| G29 | Math Grid Sprint | `/games/math-grid-sprint` | Brain / Skill | 25 格输入 | React DOM |

---

# 9. 新增 9 款游戏详细规格

以下 SEO 和页面正文写入每款游戏的 `locales.en`；对应 `locales.zh` 内容见 Part III。`{{SITE_NAME}}` 由站点配置替换，不要把花括号输出到生产 HTML。

每个封面任务统一要求：

- 内容完全原创。
- 不出现 Gamesaien、其他平台 Logo、第三方游戏名或受保护角色。
- 不在图片内绘制标题，标题由 HTML 覆盖。
- 不带水印。
- 源图保存在 `source.png`。
- 卡片图裁为 1200×675 `cover.webp`。
- 社交图安全裁为 1200×630 `og.webp`。
- WebP 质量建议 80–84，卡片图目标小于 160KB，不能以严重模糊为代价。

## G21 · Sum Orchard

### 页面与 SEO

| 字段 | 内容 |
|---|---|
| Logical route suffix | `/games/sum-orchard` |
| Primary keyword | `free number sum puzzle online` |
| SEO Title | `Sum Orchard – Free Number Sum Puzzle Online | {{SITE_NAME}}` |
| Meta description | `Drag across numbered fruit, make the target total, and clear the orchard before time runs out in this free browser number puzzle.` |
| H1 | `Play Sum Orchard Online` |
| Categories | Brain, Puzzle |
| Difficulty label | Easy to learn |
| Homepage card copy | Draw a box around numbered fruit whose total matches the target, then chain quick clears before time expires. |

### 游戏设计

**核心玩法：** An 8×12 orchard grid contains numbered fruit tokens. The player drags a rectangular selection over one or more tokens. A selection clears only when the sum of all included numbers equals the current target.

**操作：** Desktop: press and drag from one cell to another, then release. Mobile: touch-drag with pointer capture. Keyboard: focus the grid, choose an anchor with Enter, extend with Shift + Arrow keys, and confirm with Enter.

**规则：**

- The launch target is 12. Keep it fixed for the whole run so the player can scan quickly; do not copy the source game’s target, board artwork, scoring, or timing.
- Selections are axis-aligned rectangles. Empty cells inside a rectangle contribute zero; numbered tokens contribute their visible value.
- A correct selection removes every numbered token inside it. Tokens do not fall; the remaining negative space becomes part of the planning challenge.
- When the board has no legal target rectangle, immediately generate a fresh solvable board and add a 5-second clear bonus.
- The run lasts 90 seconds. Refreshing or pressing New Run discards the entire current board and score.

**计分与会话：** Award 2 points per removed token, +4 for a one-cell exact match, and a chain bonus of +3 for each correct clear made within 2.5 seconds of the previous clear, capped at +15. Incorrect selections simply dissolve without a score or time penalty. 不保存高分、局数、设置或统计。

### 实施要求

- Use React state and CSS Grid; do not use Canvas because each numbered token must remain readable to assistive technology.
- Represent the board as `(number | null)[][]`. Implement `rectFromPoints`, `sumRect`, `clearRect`, `findLegalRects`, and `hasLegalMove` as pure functions.
- Generate boards by first planting at least eight non-overlapping rectangles whose values sum to 12, then fill remaining cells with 1–9 and validate with the solver.
- Use Pointer Events with `setPointerCapture`; clamp the live selection to the grid when a drag leaves the board.
- In tests, inject a seeded random function through the game factory. Production must use an in-memory seed from `crypto.getRandomValues`.

### 页面公开正文

#### About Sum Orchard

Sum Orchard is a fast number puzzle about spotting totals inside a crowded fruit grid. Drag a rectangle around any group of numbered fruit that adds up to twelve, release to harvest it, and keep looking as the board opens up. Small exact matches are useful, but wider selections can produce stronger chains when you read the grid quickly. The run lasts only a minute and a half, and nothing is saved after the page closes or refreshes.

#### How to play

- Drag from one grid cell to another to create a rectangular selection.
- Add every visible number inside the rectangle, including numbers between the corners.
- Release when the total is exactly 12 to clear those fruit and earn points.
- Keep making valid selections until the timer reaches zero. A new solvable board appears if no move remains.

#### Tips

- Scan for single 12 tiles and simple pairs before searching larger rectangles.
- Use empty spaces to build wide rectangles without adding unwanted values.
- Plan the next selection before releasing the current one to maintain the chain bonus.

#### FAQ

**Can I select fruit that are not touching?**

Yes. Every numbered token inside the rectangle counts, while empty cells add nothing.

**Why is the target always 12?**

A fixed target keeps the game readable and makes fast visual scanning the main skill.

**Does the game save my score?**

No. Scores and boards exist only in the open page and reset on refresh.

**Can I play with a keyboard?**

Yes. The grid supports an anchor-and-extend keyboard selection flow in addition to pointer and touch input.

**Related games（实现时通过当前 Locale 生成 URL）：** [Color Cross](/{locale}/games/color-cross), [Triad Capture](/{locale}/games/triad-capture), [Target Basket](/{locale}/games/target-basket), [Math Grid Sprint](/{locale}/games/math-grid-sprint)

### 关键验收测试

- A rectangle totaling 12 clears exactly the included non-empty cells and awards the correct score.
- A rectangle totaling any other value changes neither board nor score.
- Board generation always exposes at least one legal move and never loops indefinitely.
- Pointer cancellation, resize, restart, route change, and refresh leave no timers or listeners running.

### 封面生成

```text
CODEX_IMAGE_GEN_TASK
Output source: public/images/games/sum-orchard/source.png
Final card: public/images/games/sum-orchard/cover.webp (1200×675)
Final social: public/images/games/sum-orchard/og.webp (1200×630)
Prompt:
Original polished browser puzzle cover: an overhead orchard-style grid of glossy abstract fruit tokens carrying small digits, a translucent rectangular selection glowing around a group that totals twelve, deep navy garden background, lime and apricot accents, crisp modern game UI feeling, no text, no logo, no watermark, 16:9.
Post-process:
Preserve the focal gameplay mechanic in both crops, convert to WebP quality 82, and verify that the image accurately represents the implemented game rather than the researched source website.
```

---
## G22 · Color Cross

### 页面与 SEO

| 字段 | 内容 |
|---|---|
| Logical route suffix | `/games/color-cross` |
| Primary keyword | `free color logic puzzle online` |
| SEO Title | `Color Cross – Free Color Logic Puzzle Online | {{SITE_NAME}}` |
| Meta description | `Click empty cells, match the nearest colors across rows or columns, and clear the board in Color Cross, a free online logic puzzle.` |
| H1 | `Play Color Cross Online` |
| Categories | Brain, Puzzle |
| Difficulty label | Thoughtful |
| Homepage card copy | Choose empty spaces where the nearest tiles form matching color pairs across a row, a column, or both. |

### 游戏设计

**核心玩法：** A 10×10 board contains colored symbol tiles and empty cells. Clicking an empty cell scans outward to the nearest tile in each cardinal direction. Matching opposite tiles clear as horizontal or vertical pairs.

**操作：** Desktop and mobile: click or tap an empty cell. Keyboard: move a visible focus cursor with Arrow keys and activate a cell with Enter or Space.

**规则：**

- For a chosen empty cell, find the nearest non-empty tile to the left, right, above, and below without wrapping around the board.
- If the left and right nearest tiles share the same symbol, remove that horizontal pair. Apply the same rule independently to the upper and lower pair.
- A move may remove two tiles on one axis or four tiles on both axes. A blank without a valid pair is a miss.
- The run lasts 90 seconds. A miss subtracts 4 seconds, but never takes the timer below zero before resolution.
- Colors must always be paired with distinct symbols so the puzzle remains playable without color perception.

**计分与会话：** Award 3 points for each removed tile. Clearing both axes in one move adds an 8-point cross bonus. Clearing four crosses without a miss activates a 1.5× streak multiplier until the next miss. 不保存高分、局数、设置或统计。

### 实施要求

- Use semantic buttons in a CSS Grid. Each tile must expose both color and symbol through visible glyphs and `aria-label` text.
- Implement `nearestTile`, `evaluateCross`, `applyCrossClear`, `findAllValidEmptyCells`, and `isBoardComplete` as pure functions.
- Generate the board by reverse-placing at least twelve valid cross opportunities, then add decoy tiles and validate that at least six moves are available.
- After every clear, run the solver. If no move remains while tiles are still present, offer an in-memory Shuffle button costing 6 seconds.
- The hover preview may outline candidate directions, but must not reveal whether the move is valid until activation.

### 页面公开正文

#### About Color Cross

Color Cross turns empty space into the most important part of the board. Pick a blank cell and look outward in four directions. When the nearest tiles on opposite sides share the same symbol, they disappear. A carefully chosen cell can clear both a horizontal pair and a vertical pair at once. Every tile combines a color with a shape, so the puzzle is designed to remain understandable across different color-vision needs.

#### How to play

- Choose an empty cell on the board.
- Look for the nearest tile to its left and right; a matching pair will clear.
- Check the nearest tile above and below as well; both axes can score together.
- Avoid blank cells with no matching opposite pair because a miss removes four seconds.

#### Tips

- Search for cells that sit between two obvious matching symbols first.
- Before clearing one pair, check whether it is needed to build a future cross.
- Use the shape symbols rather than relying only on color.

#### FAQ

**Do diagonal tiles count?**

No. Color Cross checks only the four cardinal directions.

**What happens when both pairs match?**

All four tiles clear and the move receives a cross bonus.

**Is there a color-blind mode?**

The default design already pairs each color with a unique symbol, and a high-contrast toggle is available for the current session.

**Is my setting saved?**

No. Accessibility toggles and all game state reset when the page refreshes.

**Related games（实现时通过当前 Locale 生成 URL）：** [Sum Orchard](/{locale}/games/sum-orchard), [Orbit Lines](/{locale}/games/orbit-lines), [Corner Stars](/{locale}/games/corner-stars), [Echo Path](/{locale}/games/echo-path)

### 关键验收测试

- Nearest-tile scans stop at board edges and ignore empty cells correctly.
- Horizontal and vertical clears resolve independently and a dual-axis move removes each tile once.
- A miss subtracts exactly four seconds and never creates a negative displayed time.
- Every generated board has valid moves, and symbol labels remain unique in high-contrast mode.

### 封面生成

```text
CODEX_IMAGE_GEN_TASK
Output source: public/images/games/color-cross/source.png
Final card: public/images/games/color-cross/cover.webp (1200×675)
Final social: public/images/games/color-cross/og.webp (1200×630)
Prompt:
Original abstract logic-game cover: a dark square grid with colored rune tiles around a glowing empty center cell, matching symbols aligned horizontally and vertically as a luminous cross, accessible shape-coded tiles, elegant indigo and emerald palette, no text, no logo, no watermark, 16:9.
Post-process:
Preserve the focal gameplay mechanic in both crops, convert to WebP quality 82, and verify that the image accurately represents the implemented game rather than the researched source website.
```

---
## G23 · Orbit Lines

### 页面与 SEO

| 字段 | 内容 |
|---|---|
| Logical route suffix | `/games/orbit-lines` |
| Primary keyword | `free line matching puzzle online` |
| SEO Title | `Orbit Lines – Free Line Matching Puzzle Online | {{SITE_NAME}}` |
| Meta description | `Slide an orb in a straight line, align three or more matching signals, and score before time expires in this free browser puzzle.` |
| H1 | `Play Orbit Lines Online` |
| Categories | Brain, Puzzle, Skill |
| Difficulty label | Strategic |
| Homepage card copy | Move one orb along a clear straight path and align matching signals across rows, columns, or diagonals. |

### 游戏设计

**核心玩法：** An 8×8 orbital board holds colored, shape-coded signal orbs. The player moves one orb along an unobstructed horizontal, vertical, or diagonal ray. A valid alignment of three or more matching orbs clears and scores.

**操作：** Click or tap an orb, then choose a highlighted destination. Keyboard: move focus, press Enter to select, use Arrow keys to inspect destinations, and press Enter again to move.

**规则：**

- An orb may move any distance in one of eight straight directions if every intermediate cell and the destination are empty.
- After a move, scan the moved orb’s row, column, and two diagonals. Empty gaps may separate matching orbs, but an orb of another symbol blocks the scan in that direction.
- If at least three matching orbs are connected through empty space across one axis, remove all matching orbs in that resolved line.
- One move may create several axes. Merge the removal set so crossing orbs score only once.
- The run lasts 110 seconds. A legal move that clears nothing subtracts 3 additional seconds.

**计分与会话：** Three orbs award 6 points, four award 10, five award 16, and six or more award `count × 4`. Simultaneous axes add a 10-point orbit bonus. 不保存高分、局数、设置或统计。

### 实施要求

- Use DOM/SVG rather than Canvas. Highlight legal destinations by ray-casting from the selected orb.
- Implement `legalDestinations`, `scanAxis`, `resolveLines`, `mergeRemovalSets`, and `findProductiveMoves` as pure functions.
- Different symbols are blockers even when they sit beyond blank cells. Write tests for both sides of the moved orb and for crossing axes.
- Generate a board with 26–30 orbs, then use a shallow solver to verify at least four productive moves before accepting the layout.
- When no productive move remains, enable a one-use Reorbit action that shuffles symbols among occupied cells and costs 8 seconds.

### 页面公开正文

#### About Orbit Lines

Orbit Lines is a movement puzzle where distance is free but direction matters. Select an orb, slide it across a clear row, column, or diagonal, and line up three or more matching signals. Empty spaces do not break a signal, but a different symbol blocks the connection. The board rewards planning several moves ahead because a harmless-looking orb can become either a bridge or a blocker.

#### How to play

- Select an orb to reveal every empty destination it can reach in a straight line.
- Move to one highlighted square without jumping over another orb.
- Create a row, column, or diagonal containing at least three matching signals.
- Keep scoring until the timer ends; non-scoring moves cost three extra seconds.

#### Tips

- Open long lanes before trying to complete a distant line.
- Remember that a different symbol blocks matching orbs behind it.
- Look for one move that completes a horizontal and diagonal line together.

#### FAQ

**Can an orb jump over another orb?**

No. Every cell between the start and destination must be empty.

**Do matching orbs need to touch?**

No. Empty gaps are allowed, but a different symbol blocks the connection.

**What is Reorbit?**

It is a one-use shuffle for a run that has no productive move. It costs eight seconds and is not saved.

**Does the board persist after refresh?**

No. Refreshing generates a new board and resets the score and timer.

**Related games（实现时通过当前 Locale 生成 URL）：** [Color Cross](/{locale}/games/color-cross), [Corner Stars](/{locale}/games/corner-stars), [Sidefall Blocks](/{locale}/games/sidefall-blocks), [Echo Path](/{locale}/games/echo-path)

### 关键验收测试

- Legal destinations include all unobstructed cells on eight rays and exclude blocked or occupied cells.
- Gap-separated matching orbs clear while a different symbol stops the scan.
- Crossing line resolutions remove the shared orb only once and calculate bonuses correctly.
- Generated boards expose productive moves and Reorbit cannot be used twice in one run.

### 封面生成

```text
CODEX_IMAGE_GEN_TASK
Output source: public/images/games/orbit-lines/source.png
Final card: public/images/games/orbit-lines/cover.webp (1200×675)
Final social: public/images/games/orbit-lines/og.webp (1200×630)
Prompt:
Original sci-fi garden puzzle cover: luminous jewel-like signal orbs on an 8x8 orbital lattice, one orb sliding along a bright diagonal ray, three matching symbols aligned across open gaps, deep midnight background with teal, amber and violet light, no text, no logo, no watermark, 16:9.
Post-process:
Preserve the focal gameplay mechanic in both crops, convert to WebP quality 82, and verify that the image accurately represents the implemented game rather than the researched source website.
```

---
## G24 · Corner Stars

### 页面与 SEO

| 字段 | 内容 |
|---|---|
| Logical route suffix | `/games/corner-stars` |
| Primary keyword | `free L shape puzzle online` |
| SEO Title | `Corner Stars – Free L Shape Puzzle Online | {{SITE_NAME}}` |
| Meta description | `Select three matching stars, form a clean right-angle corner, and clear constellations in this free browser geometry puzzle.` |
| H1 | `Play Corner Stars Online` |
| Categories | Brain, Puzzle |
| Difficulty label | Spatial |
| Homepage card copy | Find three matching stars that form an equal-arm right angle without another star blocking either leg. |

### 游戏设计

**核心玩法：** A field of stars sits on a square lattice. The player selects three stars with the same symbol. The selection scores only when one star is the right-angle corner and the two arms have equal grid length.

**操作：** Click or tap three stars. Clicking a selected star removes it from the current selection. Keyboard users move between stars and toggle selection with Space.

**规则：**

- Use a 9×9 logical lattice containing 42–50 stars and empty nodes.
- Three selected stars must share the same symbol. One point must form a 90-degree corner with the other two, and both arms must have equal length.
- Arms may use horizontal, vertical, or 45-degree diagonal directions. Their direction vectors must be perpendicular by dot product.
- No unselected star may lie strictly between the corner and either endpoint.
- The run lasts 90 seconds. Shuffle may be used repeatedly; the first two uses cost 5 seconds each and later uses cost 9 seconds.

**计分与会话：** Award 6 base points, +2 per grid unit of arm length, and +5 when the constellation uses at least one diagonal arm. Clearing three constellations within eight seconds starts a 2× Star Rush bonus for the next valid selection. 不保存高分、局数、设置或统计。

### 实施要求

- Render stars and selection legs in a responsive SVG with a fixed logical viewBox. Hit targets must be at least 44 CSS pixels on touch screens.
- Implement `findRightAngleVertex`, `armsEqual`, `isPerpendicular`, `isSegmentClear`, and `findValidConstellations` as pure geometry helpers.
- Do not rely on floating-point equality. Normalize grid direction vectors and use integer dot products and squared lengths.
- Generate boards by planting valid L triples first, then adding decoys. Reject a board with fewer than eight valid starting constellations.
- Use symbol plus color coding and provide a session-only high-contrast toggle.

### 页面公开正文

#### About Corner Stars

Corner Stars is a geometry puzzle disguised as a tiny constellation hunt. Choose three matching stars that form a perfect right angle with two equal-length arms. The corner may face any direction, including diagonally, but another star cannot sit directly on either leg. Because every valid constellation removes its three stars, the field changes quickly and short patterns can reveal longer ones.

#### How to play

- Select three stars with the same symbol.
- Make sure one selected star can act as the right-angle corner.
- Check that both arms have the same grid length and no star blocks either segment.
- Use Shuffle when the field becomes difficult, accepting its time cost.

#### Tips

- Look for compact one-cell corners before checking longer arms.
- Try each selected point as the possible corner instead of assuming the middle point is correct.
- Save early Shuffle uses for boards with very few visible matches.

#### FAQ

**Can a constellation be rotated?**

Yes. Any orientation based on 45-degree grid directions is allowed if the arms are perpendicular and equal.

**Can another star sit on a leg?**

No. A star strictly between the corner and an endpoint blocks that constellation.

**What happens after three valid stars are selected?**

The game validates the geometry immediately, scores a legal corner, or briefly explains why the selection failed.

**Are Shuffle uses saved?**

No. The board, Shuffle count, score, and timer reset on refresh.

**Related games（实现时通过当前 Locale 生成 URL）：** [Orbit Lines](/{locale}/games/orbit-lines), [Color Cross](/{locale}/games/color-cross), [Triad Capture](/{locale}/games/triad-capture), [Echo Path](/{locale}/games/echo-path)

### 关键验收测试

- All four possible choices of corner vertex are evaluated.
- Horizontal, vertical, and diagonal perpendicular vectors validate with integer geometry.
- A star on either open segment invalidates the constellation while a star beyond an endpoint does not.
- Shuffle applies the correct escalating time cost and preserves the number of remaining stars.

### 封面生成

```text
CODEX_IMAGE_GEN_TASK
Output source: public/images/games/corner-stars/source.png
Final card: public/images/games/corner-stars/cover.webp (1200×675)
Final social: public/images/games/corner-stars/og.webp (1200×630)
Prompt:
Original celestial logic puzzle cover: a dark geometric star field with three matching gem-like stars connected as a glowing perfect right-angle constellation, equal arms, subtle lattice, indigo night and soft gold accents, elegant minimal composition, no text, no logo, no watermark, 16:9.
Post-process:
Preserve the focal gameplay mechanic in both crops, convert to WebP quality 82, and verify that the image accurately represents the implemented game rather than the researched source website.
```

---
## G25 · Sidefall Blocks

### 页面与 SEO

| 字段 | 内容 |
|---|---|
| Logical route suffix | `/games/sidefall-blocks` |
| Primary keyword | `free falling block puzzle online` |
| SEO Title | `Sidefall Blocks – Free Falling Block Puzzle Online | {{SITE_NAME}}` |
| Meta description | `Slide an exposed block sideways, let gravity drop it, and clear connected color groups in this free online falling-block puzzle.` |
| H1 | `Play Sidefall Blocks Online` |
| Categories | Puzzle, Skill |
| Difficulty label | Tactical |
| Homepage card copy | Move an exposed block to another column, release it into gravity, and build larger matching groups for bonus points. |

### 游戏设计

**核心玩法：** An 8-column board contains irregular stacks of symbol-coded blocks. The player chooses an exposed top block, shifts it horizontally to another column, then releases it to fall. Orthogonally connected groups clear after landing.

**操作：** Drag an exposed block left or right and release above a destination column. Tap mode: select a block, tap a highlighted destination column. Keyboard: select a stack top, move the destination with Left/Right, and press Enter to drop.

**规则：**

- Only the top block of a non-empty column is movable. A destination column must have capacity below the 10-row ceiling.
- The block falls to the first available cell on its destination stack. The original column collapses immediately when its top block leaves.
- After landing, find the complete orthogonally connected component of the moved block. Clear it only when it contains at least three matching blocks.
- After a clear, collapse each column downward and resolve chain reactions until no group of three or more remains.
- The run lasts 110 seconds. A legal drop that creates no clear subtracts 3 seconds; returning to the original column cancels without penalty.

**计分与会话：** A group of three awards 6 points, four awards 10, five awards 16, and larger groups award `count × 4`. Each chain reaction multiplies that resolution step by its chain depth. 不保存高分、局数、设置或统计。

### 实施要求

- Use CSS Grid for the board and CSS transforms for the dragged block. A short requestAnimationFrame animation may show the fall, but rules resolve in pure TypeScript first.
- Represent each column as a bottom-up array. Implement `moveTopBlock`, `connectedComponent`, `findAllClearableGroups`, `collapseBoard`, and `resolveChains` as pure functions.
- Make illegal destinations visibly unavailable and announce the reason through a polite live region.
- Generate irregular stacks with 4–5 symbols, then verify at least five scoring moves via a one-ply solver.
- Cancel active pointer interactions on blur, route change, resize, or component unmount.

### 页面公开正文

#### About Sidefall Blocks

Sidefall Blocks mixes deliberate movement with simple gravity. Instead of steering a falling piece from the top, you take an exposed block from one stack, slide it to another column, and let it settle. A landing that connects three or more matching symbols clears the group, while bigger clusters and chain reactions create the best scores. Every move changes two columns, so a useful transfer can also expose the block you need next.

#### How to play

- Choose the top block from any non-empty column.
- Move it horizontally to a column that still has room.
- Release the block and let it fall onto the destination stack.
- Connect at least three matching blocks to clear them and trigger possible chains.

#### Tips

- Move blocks away from a column to expose a useful color underneath.
- Build groups of four or five instead of taking every immediate three-block clear.
- Check both the source and destination columns before committing to a drop.

#### FAQ

**Can I move a block from the middle of a stack?**

No. Only the currently exposed top block can move.

**What happens if no group clears?**

The move remains on the board and three seconds are removed from the timer.

**Can one move create a chain reaction?**

Yes. Columns collapse after each clear and any new group of three or more resolves at a higher multiplier.

**Does the game remember my best chain?**

No. All run statistics are temporary and reset with the page.

**Related games（实现时通过当前 Locale 生成 URL）：** [Orbit Lines](/{locale}/games/orbit-lines), [Triad Capture](/{locale}/games/triad-capture), [Color Cross](/{locale}/games/color-cross), [Sum Orchard](/{locale}/games/sum-orchard)

### 关键验收测试

- Only stack-top blocks can move and full destination columns reject the drop.
- Connected components use orthogonal adjacency only and resolve the moved block’s complete group.
- Column collapse and multi-step chain scoring are deterministic.
- Returning a block to its source cancels without score or time change.

### 封面生成

```text
CODEX_IMAGE_GEN_TASK
Output source: public/images/games/sidefall-blocks/source.png
Final card: public/images/games/sidefall-blocks/cover.webp (1200×675)
Final social: public/images/games/sidefall-blocks/og.webp (1200×630)
Prompt:
Original falling-block puzzle cover: irregular stacks of rounded symbol-coded blocks in a dark garden arcade, one bright block sliding sideways above the columns and dropping into a matching cluster that bursts with particles, mint, coral and violet palette, no text, no logo, no watermark, 16:9.
Post-process:
Preserve the focal gameplay mechanic in both crops, convert to WebP quality 82, and verify that the image accurately represents the implemented game rather than the researched source website.
```

---
## G26 · Triad Capture

### 页面与 SEO

| 字段 | 内容 |
|---|---|
| Logical route suffix | `/games/triad-capture` |
| Primary keyword | `free three color puzzle online` |
| SEO Title | `Triad Capture – Free Three-Color Puzzle Online | {{SITE_NAME}}` |
| Meta description | `Draw a rectangle containing equal sets of three symbols, clear the group, and build quick combos in this free browser puzzle.` |
| H1 | `Play Triad Capture Online` |
| Categories | Brain, Puzzle |
| Difficulty label | Quick thinking |
| Homepage card copy | Box equal numbers of three symbols—one of each, two of each, or more—and turn balanced selections into combos. |

### 游戏设计

**核心玩法：** A 9×9 field contains exactly three symbol families. The player drags a rectangle. A selection is valid when it contains the same non-zero count of all three symbols.

**操作：** Pointer and touch use drag selection. Keyboard users anchor a cell, extend a rectangle, and confirm using the same pattern as Sum Orchard.

**规则：**

- A valid rectangle may contain one, two, three, or four of each symbol. It may also include empty cells left by prior clears.
- Counts must be equal and non-zero. A selection containing 2 leaves, 2 suns, and 2 drops is valid; 2, 2, and 1 is not.
- Correctly selected tokens disappear, then each column falls downward and refills from the top with a balanced random stream.
- The refill generator must avoid creating an endless automatic clear because selections only resolve when the player releases a rectangle.
- The run lasts 90 seconds. Invalid rectangles do not cost time but break the current combo.

**计分与会话：** One triad awards 6 points, two triads 16, three triads 30, and four triads 48. Consecutive valid captures made within four seconds increase a visible combo multiplier from 1× to 2.5×. 不保存高分、局数、设置或统计。

### 实施要求

- Use CSS Grid with the shared rectangle-selection utility extracted from Sum Orchard.
- Implement `countSymbolsInRect`, `isBalancedTriad`, `clearAndCollapse`, and `balancedRefill` as pure functions.
- The refill bag must keep the long-run distribution of the three symbols within two tokens of one another.
- While dragging, show the three live counts without declaring validity by color alone; add an icon and text status.
- Provide seeded generator tests covering thousands of refills and verify distribution and board bounds.

### 页面公开正文

#### About Triad Capture

Triad Capture is a balance puzzle built around three simple symbols. Draw a rectangle that contains the same number of leaves, drops, and suns, then release to clear the whole balanced group. A tiny one-of-each capture is safe, while a rectangle containing three or four complete triads earns much more. New pieces fall in after every success, so the board stays active until the short timer ends.

#### How to play

- Drag a rectangle across the symbol field.
- Count the leaves, drops, and suns inside the selection.
- Release when all three counts are equal and greater than zero.
- Chain valid captures quickly to raise the temporary combo multiplier.

#### Tips

- Start by finding compact one-of-each rectangles to understand the board.
- Use empty cells to widen a selection without changing its symbol counts.
- Watch the live count panel and prepare the next capture before the refill settles.

#### FAQ

**Do the three symbols need to touch?**

No. Only the totals inside the rectangle matter.

**Can I capture more than one set at once?**

Yes. Equal groups of two, three, or four of each symbol receive larger rewards.

**Why do new pieces appear?**

Columns refill after a valid capture so a single run can continue for the full timer.

**Is the combo saved?**

No. It belongs only to the current run and disappears on refresh or restart.

**Related games（实现时通过当前 Locale 生成 URL）：** [Sum Orchard](/{locale}/games/sum-orchard), [Color Cross](/{locale}/games/color-cross), [Sidefall Blocks](/{locale}/games/sidefall-blocks), [Corner Stars](/{locale}/games/corner-stars)

### 关键验收测试

- Equal non-zero counts validate for one through four triads, while unequal or zero counts fail.
- Clear, gravity, and refill preserve a 9×9 board with no out-of-bounds writes.
- The refill bag remains statistically balanced across a long seeded sequence.
- Invalid captures break the combo without subtracting time or changing the board.

### 封面生成

```text
CODEX_IMAGE_GEN_TASK
Output source: public/images/games/triad-capture/source.png
Final card: public/images/games/triad-capture/cover.webp (1200×675)
Final social: public/images/games/triad-capture/og.webp (1200×630)
Prompt:
Original colorful logic puzzle cover: a clean 9x9 field of three distinct garden symbols—leaf, water drop and sun gem—with a glowing rectangular selection containing equal groups, pieces lifting away in a balanced burst, dark navy backdrop, no text, no logo, no watermark, 16:9.
Post-process:
Preserve the focal gameplay mechanic in both crops, convert to WebP quality 82, and verify that the image accurately represents the implemented game rather than the researched source website.
```

---
## G27 · Echo Path

### 页面与 SEO

| 字段 | 内容 |
|---|---|
| Logical route suffix | `/games/echo-path` |
| Primary keyword | `free color path puzzle online` |
| SEO Title | `Echo Path – Free Color Path Puzzle Online | {{SITE_NAME}}` |
| Meta description | `Draw a path with matching endpoints and one shared middle symbol, avoid used cells, and clear the board in this free logic game.` |
| H1 | `Play Echo Path Online` |
| Categories | Brain, Puzzle |
| Difficulty label | Challenging |
| Homepage card copy | Connect matching endpoints through a run of one other symbol, while every completed route permanently occupies its cells. |

### 游戏设计

**核心玩法：** A 10×10 board contains symbol tiles. The player draws an orthogonally adjacent path of at least three cells. The first and last tile must match; every interior tile must share one different symbol.

**操作：** Drag across adjacent cells or tap cells one by one. Keyboard: start with Enter, extend using Arrow keys, Backspace one step, and confirm with Enter.

**规则：**

- A path cannot leave the board, revisit a cell, cross a completed path, or use diagonal adjacency.
- The two endpoint symbols must match. All interior cells must have one identical symbol that is different from the endpoint symbol.
- A direct two-cell pair is not valid; at least one interior tile is required.
- A successful path becomes a permanent glowing vine and its cells cannot be used again. This makes later non-crossing decisions meaningful.
- The run ends after 120 seconds, when all cells are occupied, or when the solver confirms that no valid path remains.

**计分与会话：** Award 4 points for a three-cell path, then +2 for each additional interior cell. Completing two paths that share a boundary but not a cell adds a 5-point neighbor bonus. 不保存高分、局数、设置或统计。

### 实施要求

- Render the board with semantic tile buttons and an SVG overlay for the live and completed paths.
- Implement `isAdjacent`, `validateEchoPath`, `wouldCross`, `findAnyValidPath`, and `neighborBonus` as pure functions.
- Generate the board in reverse: lay down a set of non-overlapping valid paths, fill remaining cells with decoys, then hide the solution data from production state.
- The public game must not ship or expose a “show solution” control. The generator’s solution is used only to guarantee playability and in tests.
- Announce endpoint symbol, interior symbol, path length, and validation result through a concise live region.

### 页面公开正文

#### About Echo Path

Echo Path is a route-building puzzle with a strict pattern. Start on one symbol, travel through one or more copies of a second symbol, and finish on the same symbol you began with. Every successful route stays on the board as a glowing vine, so paths cannot reuse or cross occupied cells. Early choices shape the remaining space, turning a simple matching rule into a compact planning challenge.

#### How to play

- Start on a tile and move through orthogonally adjacent cells.
- Use one repeated symbol for every interior tile.
- Finish on a tile matching the starting symbol.
- Avoid completed routes because their cells remain occupied for the rest of the run.

#### Tips

- Complete constrained edge and corner paths before filling the center.
- Keep long corridors open for endpoint pairs that are far apart.
- Backtrack during a live path instead of committing to a route that blocks several cells.

#### FAQ

**Can a path move diagonally?**

No. Every step must be horizontal or vertical.

**Can the middle contain several symbols?**

No. All interior cells must share one symbol that differs from the endpoints.

**Why do completed paths stay visible?**

Permanent paths create the non-crossing planning challenge and show which cells are already used.

**Does restarting restore the original board?**

Restart creates a new in-memory board. Refreshing also starts a completely new run.

**Related games（实现时通过当前 Locale 生成 URL）：** [Color Cross](/{locale}/games/color-cross), [Corner Stars](/{locale}/games/corner-stars), [Orbit Lines](/{locale}/games/orbit-lines), [Math Grid Sprint](/{locale}/games/math-grid-sprint)

### 关键验收测试

- Valid paths require matching endpoints, a uniform different interior, and at least three cells.
- Diagonal steps, revisits, occupied cells, and attempted crossings are rejected.
- The reverse generator always produces at least one solution and never exposes it to the client UI.
- No-move detection terminates within the specified performance budget on a full 10×10 board.

### 封面生成

```text
CODEX_IMAGE_GEN_TASK
Output source: public/images/games/echo-path/source.png
Final card: public/images/games/echo-path/cover.webp (1200×675)
Final social: public/images/games/echo-path/og.webp (1200×630)
Prompt:
Original path puzzle cover: a dark 10x10 tile garden with a glowing vine-like route connecting two matching gem symbols through several identical middle symbols, other completed paths weaving nearby without crossing, elegant teal and amber lighting, no text, no logo, no watermark, 16:9.
Post-process:
Preserve the focal gameplay mechanic in both crops, convert to WebP quality 82, and verify that the image accurately represents the implemented game rather than the researched source website.
```

---
## G28 · Target Basket

### 页面与 SEO

| 字段 | 内容 |
|---|---|
| Logical route suffix | `/games/target-basket` |
| Primary keyword | `free addition pair game online` |
| SEO Title | `Target Basket – Free Addition Pair Game Online | {{SITE_NAME}}` |
| Meta description | `Choose two numbered fruit that add to the basket target and complete twelve quick rounds in this free online addition game.` |
| H1 | `Play Target Basket Online` |
| Categories | Brain, Skill |
| Difficulty label | Family friendly |
| Homepage card copy | Pick two numbered fruit whose sum matches the basket, then solve the next target before the round timer expires. |

### 游戏设计

**核心玩法：** Each round shows one target basket and six numbered fruit tokens. The player selects exactly two tokens whose values add to the target. A run contains twelve generated rounds.

**操作：** Click, tap, or keyboard-select two fruit tokens. The first choice stays visibly selected; choosing it again cancels. Number keys 1–6 may select the corresponding visible token.

**规则：**

- Every round has at least one valid pair and never requires selecting the same physical token twice.
- Numbers range from 1 to 20. Targets range from 5 to 35 and are generated from one planted pair.
- After two tokens are chosen, validate immediately. A correct pair advances after a short result animation; a wrong pair clears the selection after feedback.
- Each round begins with 12 seconds. The run ends after twelve correct answers or when a round timer reaches zero.
- Refresh returns to round one with a new sequence. Do not save accuracy, streaks, or completed rounds.

**计分与会话：** A correct pair awards 100 points plus `remainingSeconds × 5`. Consecutive first-attempt answers add a streak bonus of 25, 50, 75, then 100 points. A wrong pair removes 2 seconds from the current round. 不保存高分、局数、设置或统计。

### 实施要求

- Use semantic buttons and simple CSS motion; no Canvas is required.
- Implement `generateRound`, `findValidPairs`, `evaluatePair`, and `calculateRoundScore` as pure functions.
- Plant one solution pair, generate four decoys, shuffle, then verify whether multiple solutions exist. Multiple valid pairs are acceptable and all must score.
- Avoid targets or options that make the answer visually ambiguous because of duplicated labels; duplicate values are allowed only when represented by separate tokens and handled by unique IDs.
- Pause the timer when the document becomes hidden and resume without granting extra time.

### 页面公开正文

#### About Target Basket

Target Basket is a short addition challenge made for quick mental warmups. Each basket displays a target number and six fruit tokens wait above it. Pick any two whose values add to the target, then move through twelve fresh rounds. Fast answers earn a time bonus, while a first-attempt streak rewards accuracy without requiring an account or a saved profile.

#### How to play

- Read the target number shown on the basket.
- Select one numbered fruit, then choose a second fruit.
- If the two values add to the target, the next round begins.
- Complete twelve targets before any round timer reaches zero.

#### Tips

- Subtract the first chosen value from the target to find the needed partner.
- Scan the smallest and largest values before testing middle pairs.
- Protect the first-attempt streak by checking both numbers before the second selection.

#### FAQ

**Can a round have more than one correct pair?**

Yes. Every pair that reaches the target is accepted.

**What happens after a wrong answer?**

The selection clears and two seconds are removed from the current round.

**Is this game suitable for touch screens?**

Yes. The six large fruit buttons are designed for both phones and tablets.

**Are my accuracy results stored?**

No. Accuracy, score, streak, and round progress reset when the page refreshes.

**Related games（实现时通过当前 Locale 生成 URL）：** [Math Grid Sprint](/{locale}/games/math-grid-sprint), [Sum Orchard](/{locale}/games/sum-orchard), [Triad Capture](/{locale}/games/triad-capture), [Color Cross](/{locale}/games/color-cross)

### 关键验收测试

- Every generated round contains at least one legal pair and all legal pairs are accepted.
- Duplicate numeric values remain distinct tokens and cannot be double-selected through one ID.
- Wrong answers remove exactly two seconds while correct answers calculate time and streak bonuses correctly.
- The run ends after twelve correct rounds or a zero timer and all restart paths reset to round one.

### 封面生成

```text
CODEX_IMAGE_GEN_TASK
Output source: public/images/games/target-basket/source.png
Final card: public/images/games/target-basket/cover.webp (1200×675)
Final social: public/images/games/target-basket/og.webp (1200×630)
Prompt:
Original educational arcade cover: a charming abstract harvest basket displaying a glowing target number, six polished fruit tokens with small digits floating above, two correct tokens arcing toward the basket, rich dark garden background with warm orange and mint highlights, no title text, no logo, no watermark, 16:9.
Post-process:
Preserve the focal gameplay mechanic in both crops, convert to WebP quality 82, and verify that the image accurately represents the implemented game rather than the researched source website.
```

---
## G29 · Math Grid Sprint

### 页面与 SEO

| 字段 | 内容 |
|---|---|
| Logical route suffix | `/games/math-grid-sprint` |
| Primary keyword | `free 25 square math game online` |
| SEO Title | `Math Grid Sprint – Free 25-Square Math Game Online | {{SITE_NAME}}` |
| Meta description | `Fill a 5×5 addition, subtraction, or multiplication grid before the score counts down in this free browser math game.` |
| H1 | `Play Math Grid Sprint Online` |
| Categories | Brain, Skill |
| Difficulty label | Three modes |
| Homepage card copy | Solve a 5×5 arithmetic grid using row and column numbers while the score steadily counts down. |

### 游戏设计

**核心玩法：** Five row operands and five column operands define 25 arithmetic cells. The player chooses Addition, Subtraction, or Multiplication, then fills every answer as quickly and accurately as possible.

**操作：** Select a cell and type with the physical keyboard or use the on-screen numeric keypad. Arrow keys move between cells; Enter submits the current value; Backspace edits.

**规则：**

- Addition uses row values 1–49 and column values 1–50. Multiplication uses 2–9 on both axes.
- Subtraction orders operands so every result is non-negative: each cell calculates the larger configured row minuend minus the smaller column subtrahend.
- A mode is chosen before the timer starts. Changing mode after play begins requires confirmation and starts a completely new run.
- Correct cells lock and become read-only. Incorrect answers stay editable and receive non-color error feedback.
- The displayed score begins at 1250 and decreases by one per elapsed second, with a minimum completion score of 1.

**计分与会话：** Final score is the remaining countdown score minus 8 points for each incorrect submission, never below 1 on a completed grid. Also display elapsed time and accuracy for the current run only. 不保存高分、局数、设置或统计。

### 实施要求

- Use a native input or contenteditable-free controlled input for each answer cell. On mobile, show a custom numeric keypad while retaining accessible labels.
- Implement `buildOperandSet`, `expectedAnswer`, `validateCell`, `nextIncompleteCell`, and `calculateFinalScore` as pure functions.
- Prevent browser form submission and accidental page zoom from rapid keypad taps. Never intercept OS-level shortcuts outside the focused game shell.
- Use `inputMode="numeric"`, precise labels such as “Row 3 plus column 4,” and a live progress summary like “17 of 25 correct.”
- Pause the countdown when the page is hidden, and fully clean up the interval on restart or unmount.

### 页面公开正文

#### About Math Grid Sprint

Math Grid Sprint turns twenty-five short calculations into one focused browser challenge. Choose addition, subtraction, or multiplication, read the number at the start of each row and column, and fill the answer where they meet. Correct cells lock immediately, while the score continues to count down until the grid is complete. The result is a compact practice session with no login, lesson history, or saved grade.

#### How to play

- Choose Addition, Subtraction, or Multiplication before starting.
- Combine the number at the left of a row with the number above a column.
- Enter the answer in their intersection and submit it.
- Complete all 25 cells while preserving as much of the countdown score as possible.

#### Tips

- Complete the easiest row first to build rhythm and reduce navigation time.
- Use repeated patterns in multiplication rows instead of recalculating every cell from scratch.
- Correct mistakes immediately because every wrong submission reduces the final score.

#### FAQ

**Which operations are available?**

The launch version includes addition, non-negative subtraction, and multiplication.

**Can I leave a cell and return later?**

Yes. Only correct cells lock; incomplete or incorrect cells remain editable.

**Does the site track my practice history?**

No. The first version has no account, database, grade history, or local storage.

**What happens when I refresh?**

The selected mode, operands, answers, score, time, and accuracy all reset.

**Related games（实现时通过当前 Locale 生成 URL）：** [Target Basket](/{locale}/games/target-basket), [Sum Orchard](/{locale}/games/sum-orchard), [Echo Path](/{locale}/games/echo-path), [Color Cross](/{locale}/games/color-cross)

### 关键验收测试

- Each mode generates valid operand ranges and computes all 25 expected answers correctly.
- Correct answers lock, incorrect answers remain editable, and wrong-attempt penalties are applied once per submission.
- Keyboard and on-screen keypad navigation reaches every cell without focus loss.
- Countdown pause, restart, mode change, unmount, and refresh leave no duplicate intervals.

### 封面生成

```text
CODEX_IMAGE_GEN_TASK
Output source: public/images/games/math-grid-sprint/source.png
Final card: public/images/games/math-grid-sprint/cover.webp (1200×675)
Final social: public/images/games/math-grid-sprint/og.webp (1200×630)
Prompt:
Original math-game cover: a luminous 5x5 arithmetic grid floating over a dark botanical-tech background, row and column number markers, several answer cells lighting up correctly, subtle plus minus and multiply motifs as abstract symbols, sophisticated mint and gold palette, no text, no logo, no watermark, 16:9.
Post-process:
Preserve the focal gameplay mechanic in both crops, convert to WebP quality 82, and verify that the image accurately represents the implemented game rather than the researched source website.
```

---

# 10. SEO 实施细则（G21–G29 内容参考；最终实现以 Part 0 为准）

## 10.1 Metadata、Canonical 与 Hreflang

- 首页、集合页、Brain 分类页与 G21–G29 的 18 个本地化游戏页均使用 Next.js Metadata API。
- 统一调用 Part 0 的本地化 Metadata Builder，不得另写一套单语言实现。
- `metadataBase` 来自 `NEXT_PUBLIC_SITE_URL`，生产环境缺失时构建失败。
- `/en/...` 与 `/zh/...` 每页分别使用自引用 Canonical；不得把中文页 canonical 到英文页。
- 每个成对页面输出互惠的 `en`、`zh-CN` 和 `x-default` 替代链接。
- Production 主机只保留 www 或裸域其中一个，另一版本永久重定向。
- Preview 环境添加 `robots: { index: false, follow: false }`，且不提交 Preview Sitemap。
- 英文和中文 Title/Description 各自在本语言集合内唯一，内容自然，不反复堆叠 `free`、`online`、`game` 或中文同义词。

## 10.2 Sitemap

`src/app/sitemap.ts` 从同一静态内容目录生成最终双语集合：

- 2 个首页 URL。
- 8 个分类 URL：Puzzle、Arcade、Skill、Brain × 2 种语言。
- 2 个 Garden Logic 集合 URL。
- 58 个游戏 URL：29 个逻辑游戏 × 2 种语言。
- About、Privacy、Cookies、Terms、Contact、Accessibility 的双语 URL。

每个成对条目声明 `en`、`zh-CN` 与 `x-default`。不要加入 Preview URL、带查询参数的筛选页、游戏动态 Chunk、源图片 `source.png`、404 或测试路由。

构建测试必须校验：

- G21–G29 的 18 个本地化游戏 URL 全部存在。
- Brain 与 Garden Logic 各有中英文 URL。
- 所有语言替代 URL 可解析、互惠且无重复。
- Sitemap 中不存在无语言前缀的旧内容 URL。

## 10.3 Robots

Production：

- 允许抓取公开页面、游戏封面和正文。
- 阻止内部测试路径与构建产物索引。
- 指向唯一 Production Sitemap。

Preview：

- 页面级 `noindex, nofollow`。
- 可额外通过 `X-Robots-Tag` 防止索引。
- 不依赖 `robots.txt` 作为唯一 Preview 防护。

## 10.4 JSON-LD

Garden Logic 集合页：

- `CollectionPage`。
- `BreadcrumbList`。
- 可添加 `ItemList`，位置与页面真实卡片顺序一致。

游戏页：

- `WebPage`。
- `BreadcrumbList`。
- `VideoGame` 语义标记。

不要添加：

- `aggregateRating`。
- `review`。
- 虚假 `interactionStatistic`。
- 不存在的作者人物。
- 没有站内搜索功能时的 `SearchAction`。

JSON-LD 的 `name`、`description`、`image` 与页面可见内容保持一致。语义标记不代表 Google 一定展示富结果。

本地化要求：每个 JSON-LD 实体使用当前语言的 `name`、`description`、Breadcrumb、FAQ 和 URL，并设置 `inLanguage` 为 `en` 或 `zh-CN`；不得在一个实体中混用两套语言。

## 10.5 On-page SEO

每个新游戏页：

- 只使用一个 H1。
- About 与 How to play 默认展开。
- FAQ 可使用可访问 Accordion，但问题与回答仍存在于 HTML。
- 相关推荐至少四个，使用具体游戏名作为链接文字。
- 不发布只有 Canvas、几十字模板文案或自动拼接同义词的薄内容页。
- 玩法说明必须与实际实现一致；规则改动时同时改正文、测试和 JSON-LD。
- 公开文案不使用“best”, “most popular”, “millions of players”等未经证实说法。

## 10.6 图片 SEO

- 卡片与 OG 图使用本地路径。
- 所有卡片声明固定宽高，避免 CLS。
- 图片 Alt 描述画面和机制，例如：`Numbered fruit inside a glowing rectangular selection in Sum Orchard`。
- Alt 不重复页面 Title，不写 `free online game` 关键词串。
- 首页首张 LCP 图片可优先加载，其余 28 张卡片图懒加载。
- 原始 `source.png` 不在页面引用，也不进入 Sitemap。

---

# 11. Google AdSense 与合规

## 11.1 广告位置

允许的位置：

- 首页 Garden Logic 区块之后。
- 集合页卡片网格之后。
- 游戏区完整结束、操作说明之后的 `game-below-play`。
- 页面长正文结束前的 `game-content-end`。

禁止的位置：

- 棋盘左右紧邻区域。
- 拖拽终点或虚拟数字键盘附近。
- Play、Restart、Shuffle、New Run、Mode 按钮之间。
- 结果弹层内部。
- 计时条下方造成误触的位置。
- 伪装成提示、奖励、关卡或游戏卡片的位置。

## 11.2 游戏页布局检查

Playwright 为每个新游戏在 390×844 和 1440×1000 截图，人工与自动确认：

- 广告不覆盖游戏。
- 游戏触摸区域周边没有易误触广告。
- 广告加载后不推动正在操作的棋盘。
- 未配置广告时无空白大洞。
- Cookie/CMP 横幅不会遮住 Restart 或虚拟键盘。

## 11.3 CMP 与隐私

- 继续沿用基础项目的隐私页、Cookie Policy 和 Google CMP 方案。
- 游戏本身不设置 Cookie、不做用户画像、不收集姓名或邮箱。
- 如果添加分析工具，必须在隐私文档中列出，并在需要同意的地区等待同意后加载。
- 不把本集合包装成专门面向 13 岁以下儿童的产品；页面语言保持一般受众与家庭友好。

---

# 12. 性能、安全与工程质量

## 12.1 性能预算

新增集合不得破坏原项目预算：

- 首页初始 JS 不包含任何新游戏 Engine。
- 每个 DOM/SVG 游戏自身异步 Chunk 目标 Gzip 后小于 70KB，不含 React/Next 共享运行时。
- Garden Logic 集合页不加载九款游戏代码。
- 每张卡片 WebP 目标小于 160KB，集合 OG 图小于 180KB。
- 手机中端设备上拖拽与动画目标 60fps；规则计算不应阻塞主线程超过 50ms。
- 生成器与求解器在普通设备上应于 100ms 内完成；超时则使用预构建的安全棋盘，不允许页面卡死。

## 12.2 安全 Header

沿用基础项目 CSP 与安全 Header，并确认新增内容不需要放宽到任意第三方脚本。至少包括：

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` 禁用不需要的摄像头、麦克风和地理位置。
- 合理的 `Content-Security-Policy`，只为 AdSense/CMP 添加必要域名。
- Production HTTPS 与 HSTS 由 Vercel/域名配置验证。

游戏不申请摄像头、麦克风、通知、剪贴板、地理位置或文件系统权限。

## 12.3 浏览器目标

至少测试当前稳定版与上一主版本：

- Chrome / Edge。
- Safari iOS 与 macOS。
- Firefox。

Pointer Events、SVG、CSS Grid 和 `crypto.getRandomValues` 在目标浏览器必须可用。若需降级，提供清晰的不支持提示，不自动跳转或下载应用。

---

# 13. 测试方案

## 13.1 脚本

`package.json` 至少保留或新增：

```json
{
  "scripts": {
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:i18n": "vitest run tests/i18n",
    "test:seo": "vitest run tests/seo",
    "test:storage": "vitest run tests/storage",
    "test:e2e": "playwright test",
    "test:a11y": "playwright test tests/e2e/accessibility.spec.ts",
    "validate:catalog": "node scripts/validate-game-catalog.mjs",
    "validate:locales": "node scripts/validate-locales.mjs",
    "build": "next build"
  }
}
```

使用 ESLint CLI；README、CI 和本地脚本保持同一命令，不保留已移除或失效的框架命令。

## 13.2 共用单元测试

- 计时暂停与恢复。
- Restart 清理所有异步任务。
- Seeded RNG 可复现。
- 矩形选择映射、Clamp 与键盘扩展。
- Score 不产生 NaN、Infinity 或负数异常。
- Game phase 阻止 resolving 期间的重复输入。
- High Contrast 与 Sound 只存在当前组件状态。

## 13.3 每款游戏 Smoke Test

对 G21–G29 的 18 个中英文游戏 URL 分别执行；玩法操作可共用同一 Engine 测试，但页面 SEO 与本地化必须逐 URL 验证：

1. 页面返回 200。
2. H1、Title、Description 与 Canonical 正确。
3. 点击 Play 后游戏 Chunk 加载。
4. 完成至少一个合法操作。
5. 触发至少一个非法操作并得到非崩溃反馈。
6. 点击 Restart 后回到初始状态。
7. 刷新后分数、棋盘、模式和设置重置。
8. 控制台无 Error/Unhandled rejection。
9. 页面无 Storage 写入。
10. Related links 全部可访问。

## 13.4 E2E 特定流程

### Sum Orchard

- 使用测试 Seed 生成已知总和矩形。
- 拖拽正确区域后分数增加。
- 错误矩形不改变棋盘。

### Color Cross

- 单轴匹配清两块。
- 双轴匹配清四块并获得 Bonus。
- 无匹配空位扣时。

### Orbit Lines

- 合法直线移动成功。
- 被阻挡路径拒绝。
- 跨空格的同符号线正确清除。

### Corner Stars

- 等臂直角有效。
- 非等臂、非垂直和被阻挡选择无效。
- Shuffle 扣时递增。

### Sidefall Blocks

- 只允许移动列顶块。
- 落下形成连通组并触发重力。
- 连锁倍率正确。

### Triad Capture

- 1/1/1 与 3/3/3 有效。
- 2/2/1 无效。
- 清除后补充数量正确。

### Echo Path

- 匹配端点与统一中间符号有效。
- 斜线、复用或交叉路径无效。
- 已完成路径保持占用。

### Target Basket

- 正确数对进入下一轮。
- 错误数对扣时但不崩溃。
- 第 12 轮完成进入结果状态。

### Math Grid Sprint

- 三种模式计算正确。
- 错误答案可改，正确答案锁定。
- 25 格完成显示当前局结果。

## 13.5 无存储测试

在每款游戏完成若干操作后：

- `localStorage.length === 0`，忽略站点明确允许的非游戏键时要用白名单，而不是简单清空。
- `sessionStorage.length === 0`。
- 无 IndexedDB 游戏数据库。
- 刷新后 UI 不显示先前分数或进度。
- 网络记录中没有游戏状态 POST/PUT/PATCH 请求。

## 13.6 可访问性测试

- Axe 无 Critical 或 Serious 问题。
- 所有游戏可仅用键盘开始、进行一个合法操作、重启。
- 焦点不陷在结果弹层外。
- SVG 星点和路径拥有可读名称。
- 数字网格输入拥有行列算式标签。
- 颜色游戏在灰度截图中仍能通过符号区分。
- Reduced Motion 下没有持续闪烁或大范围位移动画。

## 13.7 视觉回归

为以下页面建立桌面与手机基线：

- 首页 Garden Logic 区块。
- `/{locale}/collections/garden-logic`。
- `/en/category/brain` 与 `/zh/category/brain`。
- G21–G29 至少各覆盖一种语言的 Idle、Playing、Finished 状态，并对另一语言做页面/HUD Smoke；关键中文文本单独保存基线。
- High Contrast 状态。
- 广告关闭状态与测试广告占位状态。

视觉测试不能用来代替规则单元测试。

---

# 14. 实施顺序

## 阶段 A：目录与站点整合

1. 扩展 `GameCategory`。
2. 添加 9 条静态内容定义。
3. 更新注册器、Sitemap、导航、筛选和目录验证。
4. 创建 Brain 分类页与 Garden Logic 集合页。
5. 先让 G21–G29 的 18 个本地化 URL 以完整对应语言正文和加载占位通过构建。

阶段验收：58 个游戏 URL 与双语内容静态构建成功，G01–G20 测试无回归。

## 阶段 B：共享规则工具

1. Seeded RNG。
2. 矩形选择。
3. 通用计时与暂停。
4. Session-only High Contrast。
5. 游戏状态机与结果面板。

阶段验收：共享单元测试全部通过。

## 阶段 C：DOM 数学与点击游戏

1. Target Basket。
2. Math Grid Sprint。
3. Color Cross。
4. Sum Orchard。

阶段验收：四款游戏规则、键盘、触摸与刷新重置通过。

## 阶段 D：网格与重力游戏

1. Triad Capture。
2. Sidefall Blocks。
3. Orbit Lines。

阶段验收：生成器属性测试、连锁和无解检测通过。

## 阶段 E：SVG 几何与路径游戏

1. Corner Stars。
2. Echo Path。

阶段验收：几何、交叉检测、键盘路径和 SVG 可访问性通过。

## 阶段 F：内容与图片

1. 调用 Image Gen skill 生成集合图与九张游戏源图。
2. 裁切、压缩和校验 WebP。
3. 写入本文英文文案，并按 Part III 写入对应简体中文文案。
4. 完成 Alt、OG、JSON-LD 与相关推荐。
5. 更新 README 与 AGENTS。

## 阶段 G：广告、完整 QA 与部署

1. 检查广告安全距离。
2. 跑完整测试矩阵。
3. 运行 Production Build。
4. 部署 Vercel Preview 并检查 noindex。
5. 合并 Production Branch。
6. 检查 Sitemap、Canonical、图片、CMP 与 ads.txt。

---

# 15. Vercel 部署规格

## 15.1 Git 与 Vercel

- 使用现有 Git 仓库和 Vercel Project。
- 每个分支 Push 产生 Preview Deployment。
- 生产分支保持现有配置，通常为 `main`。
- 不新建数据库、KV、Blob、Cron 或 Queue。
- 静态页面和本地资源应由 Vercel CDN 提供。
- 构建日志必须显示 9 个新增游戏路由为静态输出，不应为每个游戏创建业务 Function。

## 15.2 环境变量

继续使用：

```text
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SITE_NAME=ArcadeMint
NEXT_PUBLIC_ADSENSE_CLIENT=
NEXT_PUBLIC_ADSENSE_GAME_BELOW_SLOT=
NEXT_PUBLIC_ADSENSE_CONTENT_END_SLOT=
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
NEXT_PUBLIC_CONTACT_EMAIL=
```

要求：

- `NEXT_PUBLIC_SITE_URL` 在 Production 必填并使用 HTTPS。
- Preview 使用其实际预览 URL 生成页面时不能把 Preview URL写进 Production Sitemap。
- AdSense 变量缺失时组件完全隐藏。
- 不把密钥或私密 Token放入 `NEXT_PUBLIC_*`。

## 15.3 构建命令

```bash
pnpm install --frozen-lockfile
pnpm validate:catalog
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Playwright 可在 CI 独立阶段执行，合并到 Production 前必须通过：

```bash
pnpm exec playwright install --with-deps
pnpm test:e2e
```

## 15.4 Preview 验收

- 29 张卡片存在。
- Garden Logic 9 张卡片顺序正确。
- 每款新游戏真实可玩。
- Preview 页面为 noindex。
- 所有图片返回 200 且尺寸正确。
- 手机 Safari 和 Chrome 的拖拽不导致整页误滚。
- 广告关闭时布局完整。

## 15.5 Production 上线后

1. 打开 `/sitemap.xml`，确认新增 22 个本地化关键 URL：2 个集合页、2 个 Brain 分类页与 18 个 G21–G29 游戏页。
2. 在 Google Search Console 提交或重新提交唯一 Production Sitemap。
3. 对中英文 Garden Logic、Brain 和 G21–G29 游戏页分别抽样使用 URL Inspection。
4. 检查 Canonical 只指向 Production 域名。
5. 检查 `robots.txt`、`ads.txt`、Privacy 和 Cookie 页面。
6. 确认 AdSense 广告与游戏交互区域分离。
7. 监控前端错误、LCP、INP、CLS 和 404。
8. 不因为上线后暂无广告填充而反复自动刷新广告请求。

---

# 16. README 与 AGENTS 更新

## 16.1 README

README 必须新增：

- Garden Logic 概述。
- 九款新游戏的中英文名称、9 个逻辑 Slug 与 18 个双语 URL。
- 29 款游戏完整目录链接。
- 无数据库、无游戏存储说明。
- 图片由 Image Gen 生成和优化的命令。
- 本地开发、测试、构建和 Vercel 部署命令。
- 添加新 Brain Game 时同时补齐英文、中文、Metadata、Sitemap 与测试的步骤。
- 广告环境变量说明。

## 16.2 AGENTS.md

明确写入：

- 修改游戏规则时必须同步更新 Engine 测试与页面文案。
- 不得引入 Storage、数据库或 API 来保存游戏。
- 所有游戏必须延迟加载。
- 随机生成器必须可 Seed 测试并验证可玩性。
- 颜色不能作为唯一信息载体。
- 新图片不得从第三方游戏站复制。
- 修改目录后必须运行 `validate:catalog`。
- 完成前必须运行 lint、typecheck、test、test:i18n、test:seo、E2E 和 build。

---

# 17. 最终验收清单

## 内容与页面

- [ ] 中英文首页 H1 与数量文案都不再写死旧的 20。
- [ ] 英文首页显示 `All 29 games`，中文首页显示自然的“全部 29 款游戏”文案。
- [ ] 两种语言的 Garden Logic 区块都展示 9 张卡片。
- [ ] `/en/category/brain` 与 `/zh/category/brain` 均可访问。
- [ ] 中英文 Garden Logic 集合页正文、FAQ 和 9 张卡片完整。
- [ ] G21–G29 的 18 个本地化页面都拥有独立 About、How to play、Tips 与 FAQ。
- [ ] 英文 URL 的公开文案为英文，中文 URL 的公开文案为简体中文；除游戏英文品牌名外不得出现大段语言混用。

## 游戏功能

- [ ] Sum Orchard 可框选、求和、清除、换板和结束。
- [ ] Color Cross 能正确扫描四向最近符号。
- [ ] Orbit Lines 能直线移动、识别阻挡和跨空格连线。
- [ ] Corner Stars 能验证等臂直角与阻挡。
- [ ] Sidefall Blocks 能横移列顶块、下落、消除和连锁。
- [ ] Triad Capture 能识别三类等量并补充棋盘。
- [ ] Echo Path 能验证同端点、统一中间与非交叉。
- [ ] Target Basket 完成 12 回合两数配对。
- [ ] Math Grid Sprint 完成三种运算的 25 格输入。
- [ ] 每款 Restart 和浏览器刷新均完全重置。

## SEO

- [ ] G21–G29 的 9 个英文 Title/Description 在英文集合内唯一。
- [ ] G21–G29 的 9 个中文 Title/Description 在中文集合内唯一，且不是英文文本复制。
- [ ] 18 个本地化游戏页均使用 Production 自引用 Canonical，并输出互惠 `hreflang`。
- [ ] Sitemap 含 18 个新增游戏 URL、2 个 Brain URL、2 个集合 URL，且无 Preview 或无前缀旧 URL。
- [ ] 每页 JSON-LD 使用当前语言并与可见内容一致。
- [ ] 无 meta keywords、假评分、假评论和假玩家量。
- [ ] 相关推荐链接全部有效。

## 图片

- [ ] 1 张集合图与 9 张游戏源图由 Image Gen skill 生成。
- [ ] 每款有 1200×675 Cover 和 1200×630 OG。
- [ ] 图片无第三方 Logo、标题文字和水印。
- [ ] 图片与实际游戏机制一致。
- [ ] Alt 独立、描述性且不堆砌关键词。

## 工程与测试

- [ ] 目录验证显示恰好 29 款游戏。
- [ ] 新游戏未进入首页初始 Bundle。
- [ ] 游戏代码无 Storage/API/WebSocket。
- [ ] 所有生成器有 Seeded 测试与可玩性验证。
- [ ] 键盘、触摸、Reduced Motion 和 High Contrast 通过。
- [ ] Lint、Typecheck、Unit、E2E、A11y、Build 全部通过。
- [ ] 原 G01–G20 无回归。

## 广告与部署

- [ ] 广告不靠近拖拽区、键盘和游戏按钮。
- [ ] 无广告配置时不保留空白容器。
- [ ] Preview noindex。
- [ ] Production Vercel 部署成功。
- [ ] Production Sitemap、Robots、ads.txt 和法律页可访问。
- [ ] Search Console 已重新提交 Sitemap。

---

# 18. 调研来源

以下页面仅用于理解公开玩法。Codex 不得下载或复制其中的代码、图片、文案或 UI：

- [Gamesaien 首页](https://www.gamesaien.com/)
- [Fruit Box 玩法说明](https://www.gamesaien.com/game/fruit_box_a/guide/)
- [Color Tiles 玩法说明](https://www.gamesaien.com/game/color_tiles/guide/)
- [Mesh Board 玩法说明](https://www.gamesaien.com/game/mesh_board/guide/)
- [L-shaped Constellation 玩法说明](https://www.gamesaien.com/game/eruji_seiza/guide/)
- [Yokoyoko Drop 玩法说明](https://www.gamesaien.com/game/yokoyoko_drop/guide/)
- [Three-color Balls 玩法说明](https://www.gamesaien.com/game/sansyokudama/guide/)
- [Same Ends 玩法说明](https://www.gamesaien.com/game/same_ends/guide/)
- [Fruit Cart 玩法说明](https://www.gamesaien.com/game/fruit_cart/guide/)
- [Fruit 25-grid Math 玩法说明](https://www.gamesaien.com/game/25masu_a/guide/)

工程实施参考：

- [Next.js App Router documentation](https://nextjs.org/docs/app)
- [Next.js generateStaticParams](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)
- [Next.js sitemap metadata file](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs)
- [Vercel environment variables](https://vercel.com/docs/environment-variables)
- [Google Search Essentials](https://developers.google.com/search/docs/essentials)
- [Google structured data introduction](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [Google AdSense ad placement policies](https://support.google.com/adsense/answer/1346295?hl=en-GB)
- [AdSense ads on game play pages](https://support.google.com/adsense/answer/2768340?hl=en)

---

# 19. 交付声明

Codex 完成后应在最终回复中报告：

1. 实际新增的 9 个逻辑游戏，以及对应的 18 个中英文游戏 URL。
2. 生成和优化的 10 组语言无关图片资源。
3. 目录总数、两种语言内容完整性与静态构建路由总数（游戏 URL 应为 58）。
4. 执行过的测试命令及结果。
5. Vercel Preview 或 Production 部署结果。
6. 尚需站点所有者提供的域名、AdSense ID、验证字符串或联系邮箱。

不得仅说“已完成”。若某项未通过，必须明确指出失败项、错误信息与当前代码状态；不得用占位实现掩盖未完成内容。

---

# Part III：29 款游戏简体中文公开内容、运行时 UI 与中文 SEO 数据包

> 本部分与 Part I/Part II 中每款游戏的英文内容一一对应。英文内容继续使用原规格；以下中文内容必须写入同一游戏定义的 `locales.zh`。
> 所有路由均采用 Part 0 的语言前缀。中文页面不得只替换 Metadata，About、玩法、技巧、FAQ、卡片文案、HUD 与相关推荐名称也必须本地化。

## 1. 中文游戏目录

| ID | English name | 中文显示名 | 中文 URL | 中文主关键词 |
|---|---|---|---|---|
| G01 | Block Bloom | 方块绽放 | `/zh/games/block-bloom` | 免费在线方块拼图 |
| G02 | Number Merge 2048 | 数字合并 2048 | `/zh/games/number-merge-2048` | 在线 2048 小游戏 |
| G03 | Neon Snake | 霓虹贪吃蛇 | `/zh/games/neon-snake` | 在线贪吃蛇小游戏 |
| G04 | Sky Stack | 天空叠塔 | `/zh/games/sky-stack` | 在线叠塔小游戏 |
| G05 | Zigzag Drift | 之字漂移 | `/zh/games/zigzag-drift` | 在线单键驾驶小游戏 |
| G06 | Tap Hoops | 点击投篮 | `/zh/games/tap-hoops` | 在线投篮小游戏 |
| G07 | Color Pour | 彩色水排序 | `/zh/games/color-pour` | 在线水排序游戏 |
| G08 | Penalty Hero | 点球英雄 | `/zh/games/penalty-hero` | 在线点球小游戏 |
| G09 | Slope Dash | 斜坡冲刺 | `/zh/games/slope-dash` | 在线斜坡滚球游戏 |
| G10 | Helix Drop | 螺旋坠落 | `/zh/games/helix-drop` | 在线螺旋塔小游戏 |
| G11 | Tunnel Flux | 极速隧道 | `/zh/games/tunnel-flux` | 在线 3D 隧道躲避游戏 |
| G12 | Bubble Pop Shooter | 泡泡射手 | `/zh/games/bubble-pop-shooter` | 在线泡泡射击游戏 |
| G13 | Bolt Away | 螺丝拆板 | `/zh/games/bolt-away` | 在线螺丝解谜游戏 |
| G14 | Unblock Path | 滑块解围 | `/zh/games/unblock-path` | 在线滑块解谜游戏 |
| G15 | Wave Rider | 波形穿越 | `/zh/games/wave-rider` | 在线单键躲避游戏 |
| G16 | Fruit Slice Rush | 水果切割冲刺 | `/zh/games/fruit-slice-rush` | 在线切水果小游戏 |
| G17 | Hook Swing | 钩索摆荡 | `/zh/games/hook-swing` | 在线钩索摆荡小游戏 |
| G18 | Trap Runner | 陷阱跑者 | `/zh/games/trap-runner` | 在线陷阱闯关游戏 |
| G19 | Rugged Wheels | 崎岖车轮 | `/zh/games/rugged-wheels` | 在线物理小车游戏 |
| G20 | Classic Solitaire | 经典纸牌接龙 | `/zh/games/classic-solitaire` | 在线纸牌接龙 |
| G21 | Sum Orchard | 数字果园 | `/zh/games/sum-orchard` | 在线数字求和游戏 |
| G22 | Color Cross | 色彩十字 | `/zh/games/color-cross` | 在线颜色逻辑游戏 |
| G23 | Orbit Lines | 轨道连线 | `/zh/games/orbit-lines` | 在线连珠益智游戏 |
| G24 | Corner Stars | 星角拼图 | `/zh/games/corner-stars` | 在线 L 形几何拼图 |
| G25 | Sidefall Blocks | 侧落方块 | `/zh/games/sidefall-blocks` | 在线方块下落游戏 |
| G26 | Triad Capture | 三色框选 | `/zh/games/triad-capture` | 在线三色消除游戏 |
| G27 | Echo Path | 回声连线 | `/zh/games/echo-path` | 在线路径连接游戏 |
| G28 | Target Basket | 目标数字篮 | `/zh/games/target-basket` | 在线两数求和游戏 |
| G29 | Math Grid Sprint | 数学方格冲刺 | `/zh/games/math-grid-sprint` | 在线数学方格游戏 |

主关键词只用于编辑规划，不输出 `meta keywords`。

## 2. 每款游戏中文内容

所有 `{{SITE_NAME}}` 在生成 Metadata 时由站点配置替换，不得原样出现在生产 HTML。

## G01 · 方块绽放（Block Bloom）

### 中文页面与 SEO

| 字段 | 内容 |
|---|---|
| English URL | `/en/games/block-bloom` |
| 中文 URL | `/zh/games/block-bloom` |
| 中文显示名 | `方块绽放` |
| 中文主关键词 | `免费在线方块拼图` |
| 中文 SEO Title | `方块绽放（Block Bloom）- 免费在线方块拼图 | {{SITE_NAME}}` |
| 中文 Meta description | `把彩色图形放入 10×10 棋盘，填满整行或整列即可消除。无需下载或登录，电脑和手机浏览器都能免费游玩。` |
| 中文 H1 | `在线玩方块绽放（Block Bloom）` |
| 中文分类 | 益智, 技巧 |
| 中文难度标签 | 容易上手 |
| 中文首页卡片文案 | 每次摆放三块彩色图形，消除完整行列，并为后续方块保留足够空间。 |
| 中文图片 Alt | 方块绽放 游戏封面，每次摆放三块彩色图形，消除完整行列，并为后续方块保留足够空间。 |

### 中文 About

方块绽放是一款节奏轻松的方块拼图。你需要从托盘中选择固定方向的图形，将它们放进棋盘，并通过填满整行或整列腾出空间。游戏没有倒计时、账号和云存档，当前局面与分数只保留在页面内存中；刷新页面后会立即生成一盘全新的游戏。

### 中文玩法说明

- 从托盘中选择一块可用图形。
- 把图形放到棋盘的空白位置，重叠或越界的摆放不会生效。
- 填满一整行或一整列即可消除对应方格并得分。
- 用完三块图形后会获得下一组；当剩余图形全部无处可放时，本局结束。

### 中文游戏技巧

- 不要过早堵住棋盘中央，中央区域越灵活，后续选择越多。
- 提前为大正方形和长条图形预留空间。
- 优先寻找可以同时消除一行和一列的位置。

### 中文 FAQ

**方块可以旋转吗？**

首版不能旋转。固定方向是关卡判断与空间规划的一部分。

**会保存最高分吗？**

不会。所有分数和棋盘状态都只存在于当前页面，刷新后完全重置。

**手机上可以玩吗？**

可以。棋盘和托盘会根据屏幕缩放，点击或触摸即可完成全部操作。

**中文相关推荐：** [数字合并 2048](/zh/games/number-merge-2048)、[彩色水排序](/zh/games/color-pour)、[泡泡射手](/zh/games/bubble-pop-shooter)、[滑块解围](/zh/games/unblock-path)

### 本地化验收补充

- 英文页使用 `Block Bloom` 与 Part I/Part II 中的英文 SEO；中文页使用 `方块绽放` 与本节中文 SEO。
- 两个页面共用同一玩法实现、图片和测试规则，但按钮、HUD、结果层、教程与错误提示按当前 Locale 输出。
- 中文页 canonical 指向自身，英文页 canonical 指向自身；两页互相输出 `hreflang`。
- 在中文页面刷新、重新开始或切换语言后，不恢复任何分数、关卡或临时设置。

---

## G02 · 数字合并 2048（Number Merge 2048）

### 中文页面与 SEO

| 字段 | 内容 |
|---|---|
| English URL | `/en/games/number-merge-2048` |
| 中文 URL | `/zh/games/number-merge-2048` |
| 中文显示名 | `数字合并 2048` |
| 中文主关键词 | `在线 2048 小游戏` |
| 中文 SEO Title | `数字合并 2048 - 免费在线 2048 小游戏 | {{SITE_NAME}}` |
| 中文 Meta description | `滑动棋盘并合并相同数字，逐步组成更大的方块，尝试得到 2048。无需注册或下载，电脑与手机都可直接游玩。` |
| 中文 H1 | `在线玩数字合并 2048` |
| 中文分类 | 益智 |
| 中文难度标签 | 容易上手 |
| 中文首页卡片文案 | 滑动并合并相同数字，在棋盘被填满前尽量组成 2048 或更大的数字。 |
| 中文图片 Alt | 数字合并 2048 游戏封面，滑动并合并相同数字，在棋盘被填满前尽量组成 2048 或更大的数字。 |

### 中文 About

数字合并 2048 是一款经典的数字滑块拼图。每次向一个方向移动时，棋盘上的所有方块会一起滑动，相同数字在一次移动中可以合并。新数字会不断出现，因此你既要追求更大的方块，也要维持棋盘的可移动空间。页面刷新后，棋盘、分数和撤销记录全部重新开始。

### 中文玩法说明

- 使用方向键、WASD 或触摸滑动，让所有数字向同一方向移动。
- 两个数值相同的方块碰到一起时会合并成更大的数字。
- 每次有效移动后，空位中会生成一个新的数字方块。
- 当棋盘没有空位且无法继续合并时，本局结束。

### 中文游戏技巧

- 尽量把最大数字固定在一个角落。
- 让数字按大小形成稳定顺序，减少来回打乱。
- 移动前先判断新方块可能出现的位置，避免封死整行。

### 中文 FAQ

**一定要合成 2048 才算完成吗？**

2048 是主要目标，但达到后可以继续挑战更大的数字，直到棋盘无法移动。

**是否支持撤销？**

可以提供有限的当前会话撤销，但撤销历史不会保存，刷新后清空。

**游戏会记住我的棋盘吗？**

不会。刷新页面或重新进入游戏都会开始一盘新的棋局。

**中文相关推荐：** [方块绽放](/zh/games/block-bloom)、[彩色水排序](/zh/games/color-pour)、[滑块解围](/zh/games/unblock-path)、[经典纸牌接龙](/zh/games/classic-solitaire)

### 本地化验收补充

- 英文页使用 `Number Merge 2048` 与 Part I/Part II 中的英文 SEO；中文页使用 `数字合并 2048` 与本节中文 SEO。
- 两个页面共用同一玩法实现、图片和测试规则，但按钮、HUD、结果层、教程与错误提示按当前 Locale 输出。
- 中文页 canonical 指向自身，英文页 canonical 指向自身；两页互相输出 `hreflang`。
- 在中文页面刷新、重新开始或切换语言后，不恢复任何分数、关卡或临时设置。

---

## G03 · 霓虹贪吃蛇（Neon Snake）

### 中文页面与 SEO

| 字段 | 内容 |
|---|---|
| English URL | `/en/games/neon-snake` |
| 中文 URL | `/zh/games/neon-snake` |
| 中文显示名 | `霓虹贪吃蛇` |
| 中文主关键词 | `在线贪吃蛇小游戏` |
| 中文 SEO Title | `霓虹贪吃蛇 - 免费在线贪吃蛇小游戏 | {{SITE_NAME}}` |
| 中文 Meta description | `控制发光小蛇吃掉食物并不断变长，同时避开墙壁和自己的身体。支持键盘与触摸操作，打开浏览器即可免费玩。` |
| 中文 H1 | `在线玩霓虹贪吃蛇` |
| 中文分类 | 街机, 技巧 |
| 中文难度标签 | 简单 |
| 中文首页卡片文案 | 引导发光小蛇寻找食物，在速度不断提升的棋盘上尽可能生存更久。 |
| 中文图片 Alt | 霓虹贪吃蛇 游戏封面，引导发光小蛇寻找食物，在速度不断提升的棋盘上尽可能生存更久。 |

### 中文 About

霓虹贪吃蛇保留了经典贪吃蛇最直接的规则：寻找食物、增长身体并避免碰撞。随着得分提高，小蛇移动会逐渐加快，留给你的转向时间越来越短。游戏不保存成绩或设置，刷新页面后会从初始长度和初始速度重新开始。

### 中文玩法说明

- 使用方向键或屏幕上的方向控制小蛇移动。
- 吃到发光食物后，小蛇会增长并获得分数。
- 不能直接向当前移动方向的反方向掉头。
- 撞到边界或自己的身体时，本局结束。

### 中文游戏技巧

- 尽量沿棋盘边缘绕行，为中间区域保留回旋空间。
- 小蛇变长后提前规划两到三次转向。
- 速度提高时减少不必要的急转弯。

### 中文 FAQ

**可以穿过墙壁吗？**

不能。撞到棋盘边界会立即结束当前游戏。

**速度会一直变快吗？**

速度会随得分分阶段提升，但会设置上限，确保操作仍然可控。

**能保存最高分吗？**

不能。最高分仅在当前页面会话中显示，刷新后重置。

**中文相关推荐：** [之字漂移](/zh/games/zigzag-drift)、[斜坡冲刺](/zh/games/slope-dash)、[极速隧道](/zh/games/tunnel-flux)、[水果切割冲刺](/zh/games/fruit-slice-rush)

### 本地化验收补充

- 英文页使用 `Neon Snake` 与 Part I/Part II 中的英文 SEO；中文页使用 `霓虹贪吃蛇` 与本节中文 SEO。
- 两个页面共用同一玩法实现、图片和测试规则，但按钮、HUD、结果层、教程与错误提示按当前 Locale 输出。
- 中文页 canonical 指向自身，英文页 canonical 指向自身；两页互相输出 `hreflang`。
- 在中文页面刷新、重新开始或切换语言后，不恢复任何分数、关卡或临时设置。

---

## G04 · 天空叠塔（Sky Stack）

### 中文页面与 SEO

| 字段 | 内容 |
|---|---|
| English URL | `/en/games/sky-stack` |
| 中文 URL | `/zh/games/sky-stack` |
| 中文显示名 | `天空叠塔` |
| 中文主关键词 | `在线叠塔小游戏` |
| 中文 SEO Title | `天空叠塔 - 免费在线叠塔小游戏 | {{SITE_NAME}}` |
| 中文 Meta description | `看准时机放下左右移动的平台，切掉悬空部分并不断向上叠高。单键即可操作，手机和电脑浏览器都能直接玩。` |
| 中文 H1 | `在线玩天空叠塔` |
| 中文分类 | 街机, 技巧 |
| 中文难度标签 | 简单 |
| 中文首页卡片文案 | 在平台移动到合适位置时点击落下，减少错位并尽可能搭出更高的塔。 |
| 中文图片 Alt | 天空叠塔 游戏封面，在平台移动到合适位置时点击落下，减少错位并尽可能搭出更高的塔。 |

### 中文 About

天空叠塔是一款只需要一次点击的时机挑战。每一层平台都会水平移动，你需要在它与下方平台尽量重合时将其放下。超出部分会被切除，下一层的可落区域也会变窄。完全错开后本局结束，刷新页面会清空当前高度与分数。

### 中文玩法说明

- 点击、轻触或按空格键，让正在移动的平台落下。
- 与下层重合的部分会保留，悬空部分会被切除。
- 连续完美重合可以获得额外分数与视觉反馈。
- 当平台完全没有重合区域时，本局结束。

### 中文游戏技巧

- 观察平台速度，尽量建立稳定的点击节奏。
- 平台变窄后不要只盯边缘，关注中心线更容易判断。
- 连续完美放置会让后续容错更高。

### 中文 FAQ

**需要控制左右移动吗？**

不需要。平台自动移动，玩家只负责选择落下时机。

**塔有最高层数吗？**

没有固定上限，直到一次平台完全落空为止。

**刷新后会保留最高塔吗？**

不会。高度、分数和连续完美次数都会重置。

**中文相关推荐：** [之字漂移](/zh/games/zigzag-drift)、[点击投篮](/zh/games/tap-hoops)、[波形穿越](/zh/games/wave-rider)、[斜坡冲刺](/zh/games/slope-dash)

### 本地化验收补充

- 英文页使用 `Sky Stack` 与 Part I/Part II 中的英文 SEO；中文页使用 `天空叠塔` 与本节中文 SEO。
- 两个页面共用同一玩法实现、图片和测试规则，但按钮、HUD、结果层、教程与错误提示按当前 Locale 输出。
- 中文页 canonical 指向自身，英文页 canonical 指向自身；两页互相输出 `hreflang`。
- 在中文页面刷新、重新开始或切换语言后，不恢复任何分数、关卡或临时设置。

---

## G05 · 之字漂移（Zigzag Drift）

### 中文页面与 SEO

| 字段 | 内容 |
|---|---|
| English URL | `/en/games/zigzag-drift` |
| 中文 URL | `/zh/games/zigzag-drift` |
| 中文显示名 | `之字漂移` |
| 中文主关键词 | `在线单键驾驶小游戏` |
| 中文 SEO Title | `之字漂移 - 免费在线单键驾驶小游戏 | {{SITE_NAME}}` |
| 中文 Meta description | `点击即可改变小车方向，在不断延伸的之字道路上收集星星并避免坠落。无需下载，手机和电脑都能直接游玩。` |
| 中文 H1 | `在线玩之字漂移` |
| 中文分类 | 街机, 技巧 |
| 中文难度标签 | 中等 |
| 中文首页卡片文案 | 把握转弯时机，让小车留在无尽的之字道路上，并沿途收集星星。 |
| 中文图片 Alt | 之字漂移 游戏封面，把握转弯时机，让小车留在无尽的之字道路上，并沿途收集星星。 |

### 中文 About

之字漂移把驾驶简化成一个动作：每次点击都会切换小车的前进方向。道路会不断向前生成，弯道间距和速度逐渐增加，你需要用稳定节奏应对越来越紧凑的路线。坠出道路后本局结束，刷新页面会重新生成路线并清零分数。

### 中文玩法说明

- 点击、触摸或按空格键切换小车前进方向。
- 在到达每个拐角前完成转向，确保车辆仍留在道路上。
- 收集道路上的星星可获得额外分数。
- 车辆驶出道路后本局结束。

### 中文游戏技巧

- 不要等到车轮碰到边缘才转向，提前一点更稳定。
- 观察连续弯道的节奏，而不是只关注当前拐角。
- 星星位置危险时优先保证生存，不必强行收集。

### 中文 FAQ

**可以控制车速吗？**

首版不能主动加速或减速，速度会随行驶距离逐步提高。

**道路每次都一样吗？**

不会。道路由前端程序在当前会话中生成，刷新后会得到新的路线。

**是否支持手机操作？**

支持。整块游戏区域都可以作为触摸输入区。

**中文相关推荐：** [天空叠塔](/zh/games/sky-stack)、[斜坡冲刺](/zh/games/slope-dash)、[波形穿越](/zh/games/wave-rider)、[崎岖车轮](/zh/games/rugged-wheels)

### 本地化验收补充

- 英文页使用 `Zigzag Drift` 与 Part I/Part II 中的英文 SEO；中文页使用 `之字漂移` 与本节中文 SEO。
- 两个页面共用同一玩法实现、图片和测试规则，但按钮、HUD、结果层、教程与错误提示按当前 Locale 输出。
- 中文页 canonical 指向自身，英文页 canonical 指向自身；两页互相输出 `hreflang`。
- 在中文页面刷新、重新开始或切换语言后，不恢复任何分数、关卡或临时设置。

---

## G06 · 点击投篮（Tap Hoops）

### 中文页面与 SEO

| 字段 | 内容 |
|---|---|
| English URL | `/en/games/tap-hoops` |
| 中文 URL | `/zh/games/tap-hoops` |
| 中文显示名 | `点击投篮` |
| 中文主关键词 | `在线投篮小游戏` |
| 中文 SEO Title | `点击投篮 - 免费在线篮球小游戏 | {{SITE_NAME}}` |
| 中文 Meta description | `通过连续点击让篮球弹起，穿过左右移动的篮筐并延续得分。单键操作，适合手机和电脑浏览器快速游玩。` |
| 中文 H1 | `在线玩点击投篮` |
| 中文分类 | 街机, 技巧 |
| 中文难度标签 | 中等 |
| 中文首页卡片文案 | 点击让篮球向上弹跳，穿过不断变化位置的篮筐，并保持连续命中。 |
| 中文图片 Alt | 点击投篮 游戏封面，点击让篮球向上弹跳，穿过不断变化位置的篮筐，并保持连续命中。 |

### 中文 About

点击投篮是一款简单但需要节奏感的篮球小游戏。每次点击都会给篮球一个向上的冲量，你需要同时判断重力、水平位移和篮筐位置。成功穿框后会生成下一只篮筐，连续命中可获得更高奖励；刷新页面会清空本局连击与分数。

### 中文玩法说明

- 点击、触摸或按空格键，让篮球获得向上的力量。
- 调整点击频率，使篮球从篮筐上方穿过并落入其中。
- 成功命中后，下一只篮筐会出现在新的位置。
- 篮球落出可玩区域或超时未命中时，本局结束。

### 中文游戏技巧

- 短促连续点击适合修正高度，长时间停顿会让球快速下落。
- 先把球送到篮筐上方，再减少点击让它自然落下。
- 篮筐移动时提前瞄准其运动方向。

### 中文 FAQ

**篮球会自动向前移动吗？**

会有受控的水平运动，玩家主要通过点击改变垂直速度。

**连续命中有什么作用？**

连续命中会提高连击奖励，并可能加快篮筐变化速度。

**会保存我的连胜纪录吗？**

不会。连击和分数只在当前页面中存在。

**中文相关推荐：** [点球英雄](/zh/games/penalty-hero)、[天空叠塔](/zh/games/sky-stack)、[水果切割冲刺](/zh/games/fruit-slice-rush)、[之字漂移](/zh/games/zigzag-drift)

### 本地化验收补充

- 英文页使用 `Tap Hoops` 与 Part I/Part II 中的英文 SEO；中文页使用 `点击投篮` 与本节中文 SEO。
- 两个页面共用同一玩法实现、图片和测试规则，但按钮、HUD、结果层、教程与错误提示按当前 Locale 输出。
- 中文页 canonical 指向自身，英文页 canonical 指向自身；两页互相输出 `hreflang`。
- 在中文页面刷新、重新开始或切换语言后，不恢复任何分数、关卡或临时设置。

---

## G07 · 彩色水排序（Color Pour）

### 中文页面与 SEO

| 字段 | 内容 |
|---|---|
| English URL | `/en/games/color-pour` |
| 中文 URL | `/zh/games/color-pour` |
| 中文显示名 | `彩色水排序` |
| 中文主关键词 | `在线水排序游戏` |
| 中文 SEO Title | `彩色水排序 - 免费在线水排序游戏 | {{SITE_NAME}}` |
| 中文 Meta description | `把分层颜色倒入不同试管，让每个试管最终只保留一种颜色。支持触摸、鼠标和撤销，刷新页面后从第一关重来。` |
| 中文 H1 | `在线玩彩色水排序` |
| 中文分类 | 益智 |
| 中文难度标签 | 简单到中等 |
| 中文首页卡片文案 | 在试管之间倒出顶层颜色，用尽量少的步骤把每种颜色整理到同一容器。 |
| 中文图片 Alt | 彩色水排序 游戏封面，在试管之间倒出顶层颜色，用尽量少的步骤把每种颜色整理到同一容器。 |

### 中文 About

彩色水排序是一款需要规划步骤的分层整理谜题。只有顶部颜色相同且目标试管仍有空间时才能继续倒入，因此一次看似方便的操作也可能堵住后面的路线。关卡配置打包在前端，不需要数据库；当前关卡与撤销历史在刷新后全部回到初始状态。

### 中文玩法说明

- 先选择装有颜色的试管，再选择要倒入的目标试管。
- 只有目标为空，或目标顶部颜色与待倒颜色相同时才能倾倒。
- 一次会倒出连续相同颜色，直到颜色变化或目标试管装满。
- 让每个非空试管只包含一种颜色即可完成关卡。

### 中文游戏技巧

- 尽量保留至少一个空试管作为临时空间。
- 不要过早把不同颜色压在关键颜色上方。
- 使用撤销检查另一条路线，但刷新后撤销历史会清空。

### 中文 FAQ

**关卡是随机生成的吗？**

首版以经过验证的本地关卡为主，确保每一关都存在可完成解法。

**可以撤销操作吗？**

可以在当前页面会话中撤销有限步骤，但不会跨刷新保存。

**为什么有些颜色不能倒入？**

目标试管必须为空或顶部颜色相同，并且还要有足够容量。

**中文相关推荐：** [方块绽放](/zh/games/block-bloom)、[螺丝拆板](/zh/games/bolt-away)、[滑块解围](/zh/games/unblock-path)、[经典纸牌接龙](/zh/games/classic-solitaire)

### 本地化验收补充

- 英文页使用 `Color Pour` 与 Part I/Part II 中的英文 SEO；中文页使用 `彩色水排序` 与本节中文 SEO。
- 两个页面共用同一玩法实现、图片和测试规则，但按钮、HUD、结果层、教程与错误提示按当前 Locale 输出。
- 中文页 canonical 指向自身，英文页 canonical 指向自身；两页互相输出 `hreflang`。
- 在中文页面刷新、重新开始或切换语言后，不恢复任何分数、关卡或临时设置。

---

## G08 · 点球英雄（Penalty Hero）

### 中文页面与 SEO

| 字段 | 内容 |
|---|---|
| English URL | `/en/games/penalty-hero` |
| 中文 URL | `/zh/games/penalty-hero` |
| 中文显示名 | `点球英雄` |
| 中文主关键词 | `在线点球小游戏` |
| 中文 SEO Title | `点球英雄 - 免费在线足球点球小游戏 | {{SITE_NAME}}` |
| 中文 Meta description | `完成五次射门与五次扑救，在快速点球对决中击败电脑对手。无需球队授权、下载或登录，浏览器打开即可玩。` |
| 中文 H1 | `在线玩点球英雄` |
| 中文分类 | 街机, 技巧 |
| 中文难度标签 | 简单 |
| 中文首页卡片文案 | 完成五次射门和五次扑救，通过瞄准、力度与判断赢下单人点球对决。 |
| 中文图片 Alt | 点球英雄 游戏封面，完成五次射门和五次扑救，通过瞄准、力度与判断赢下单人点球对决。 |

### 中文 About

点球英雄是一款单人足球点球挑战。射门阶段需要选择方向和力度，守门阶段则要根据提示判断来球方向。比赛采用有限轮次，电脑对手遵循透明且可测试的概率规则，不使用真实球队、球员或联赛素材。刷新页面后比赛从第一轮重新开始。

### 中文玩法说明

- 射门时拖动或点击选择目标方向，并控制合适力度。
- 守门时在限定时间内选择扑救方向。
- 完成五次射门和五次扑救后比较总进球数。
- 若比分相同，可进入有限的加赛轮次决定胜负。

### 中文游戏技巧

- 射门不要总选择同一方向，电脑会根据公开权重做出判断。
- 力度过大可能降低准确度，先追求稳定命中。
- 守门时关注球员动作提示，但不要等待到最后一刻。

### 中文 FAQ

**对手是真人吗？**

不是。首版仅提供单人模式，所有对手行为都在浏览器本地计算。

**游戏里会使用真实球队吗？**

不会。队徽、球衣、名称和场地均为原创或通用设计。

**比赛结果会保存吗？**

不会。刷新页面后比分与轮次全部清零。

**中文相关推荐：** [点击投篮](/zh/games/tap-hoops)、[之字漂移](/zh/games/zigzag-drift)、[崎岖车轮](/zh/games/rugged-wheels)、[斜坡冲刺](/zh/games/slope-dash)

### 本地化验收补充

- 英文页使用 `Penalty Hero` 与 Part I/Part II 中的英文 SEO；中文页使用 `点球英雄` 与本节中文 SEO。
- 两个页面共用同一玩法实现、图片和测试规则，但按钮、HUD、结果层、教程与错误提示按当前 Locale 输出。
- 中文页 canonical 指向自身，英文页 canonical 指向自身；两页互相输出 `hreflang`。
- 在中文页面刷新、重新开始或切换语言后，不恢复任何分数、关卡或临时设置。

---

## G09 · 斜坡冲刺（Slope Dash）

### 中文页面与 SEO

| 字段 | 内容 |
|---|---|
| English URL | `/en/games/slope-dash` |
| 中文 URL | `/zh/games/slope-dash` |
| 中文显示名 | `斜坡冲刺` |
| 中文主关键词 | `在线斜坡滚球游戏` |
| 中文 SEO Title | `斜坡冲刺 - 免费在线斜坡滚球游戏 | {{SITE_NAME}}` |
| 中文 Meta description | `操控高速小球沿霓虹斜坡前进，躲避障碍、跨越缺口并挑战更远距离。支持键盘与触摸，刷新后重新开始。` |
| 中文 H1 | `在线玩斜坡冲刺` |
| 中文分类 | 街机, 技巧 |
| 中文难度标签 | 中等 |
| 中文首页卡片文案 | 操控滚动小球沿无尽霓虹轨道前进，避开障碍并适应不断提升的速度。 |
| 中文图片 Alt | 斜坡冲刺 游戏封面，操控滚动小球沿无尽霓虹轨道前进，避开障碍并适应不断提升的速度。 |

### 中文 About

斜坡冲刺是一款强调反应与细微控制的滚珠游戏。轨道会在前方持续生成，坡度、缺口和障碍组合逐渐变难，小球速度也会随距离提升。所有赛道片段都在浏览器内运行，本局距离和分数不会保存，刷新后立即开始新的路线。

### 中文玩法说明

- 使用左右方向键、A/D 或触摸控制小球横向移动。
- 保持小球位于轨道范围内，并避开挡板和危险区域。
- 穿过安全门或收集物可获得额外分数。
- 掉下轨道或撞上致命障碍后，本局结束。

### 中文游戏技巧

- 高速时使用短而小的方向修正，避免过度转向。
- 把视线放在小球前方一段距离，提前判断障碍组合。
- 过缺口前尽量回到轨道中央。

### 中文 FAQ

**赛道会重复吗？**

赛道由原创片段按规则组合，单局中会出现变化，刷新后重新生成。

**手机上如何控制？**

可使用屏幕左右触控区或拖动方式，横屏体验更稳定。

**是否保存最远距离？**

不会。最远距离只在当前页面会话中显示。

**中文相关推荐：** [极速隧道](/zh/games/tunnel-flux)、[螺旋坠落](/zh/games/helix-drop)、[之字漂移](/zh/games/zigzag-drift)、[波形穿越](/zh/games/wave-rider)

### 本地化验收补充

- 英文页使用 `Slope Dash` 与 Part I/Part II 中的英文 SEO；中文页使用 `斜坡冲刺` 与本节中文 SEO。
- 两个页面共用同一玩法实现、图片和测试规则，但按钮、HUD、结果层、教程与错误提示按当前 Locale 输出。
- 中文页 canonical 指向自身，英文页 canonical 指向自身；两页互相输出 `hreflang`。
- 在中文页面刷新、重新开始或切换语言后，不恢复任何分数、关卡或临时设置。

---

## G10 · 螺旋坠落（Helix Drop）

### 中文页面与 SEO

| 字段 | 内容 |
|---|---|
| English URL | `/en/games/helix-drop` |
| 中文 URL | `/zh/games/helix-drop` |
| 中文显示名 | `螺旋坠落` |
| 中文主关键词 | `在线螺旋塔小游戏` |
| 中文 SEO Title | `螺旋坠落 - 免费在线螺旋塔小游戏 | {{SITE_NAME}}` |
| 中文 Meta description | `旋转螺旋塔，让弹跳小球从安全缺口连续下落，同时避开危险平台。触摸或拖动即可操作，浏览器中免费游玩。` |
| 中文 H1 | `在线玩螺旋坠落` |
| 中文分类 | 街机, 技巧 |
| 中文难度标签 | 中等 |
| 中文首页卡片文案 | 旋转塔身对齐缺口，引导弹跳小球向下穿越，并避开所有危险色平台。 |
| 中文图片 Alt | 螺旋坠落 游戏封面，旋转塔身对齐缺口，引导弹跳小球向下穿越，并避开所有危险色平台。 |

### 中文 About

螺旋坠落通过旋转塔身来改变小球下方的落点。普通平台可以承接小球，缺口允许继续下落，危险区域则会结束当前游戏。连续穿过多层可触发连坠奖励，但也需要更快判断。刷新页面后塔层布局、得分与连击全部重置。

### 中文玩法说明

- 左右拖动或使用方向键旋转螺旋塔。
- 让小球对准平台缺口并继续向下坠落。
- 落在普通区域可以反弹，落在危险区域会失败。
- 连续穿越多层可以获得额外连击分数。

### 中文游戏技巧

- 先观察下一到两层缺口，避免只盯当前平台。
- 连续下坠时提前调整塔的角度。
- 危险区域较多时，宁可落在安全平台重新判断。

### 中文 FAQ

**我控制的是小球还是塔？**

玩家旋转塔身，小球会根据重力自动弹跳和下落。

**塔层每局相同吗？**

布局会从经过验证的片段中生成，刷新后会重新组合。

**连续穿层有什么奖励？**

连续穿过多层会提高当前连击和得分，但不会永久保存。

**中文相关推荐：** [斜坡冲刺](/zh/games/slope-dash)、[极速隧道](/zh/games/tunnel-flux)、[波形穿越](/zh/games/wave-rider)、[天空叠塔](/zh/games/sky-stack)

### 本地化验收补充

- 英文页使用 `Helix Drop` 与 Part I/Part II 中的英文 SEO；中文页使用 `螺旋坠落` 与本节中文 SEO。
- 两个页面共用同一玩法实现、图片和测试规则，但按钮、HUD、结果层、教程与错误提示按当前 Locale 输出。
- 中文页 canonical 指向自身，英文页 canonical 指向自身；两页互相输出 `hreflang`。
- 在中文页面刷新、重新开始或切换语言后，不恢复任何分数、关卡或临时设置。

---

## G11 · 极速隧道（Tunnel Flux）

### 中文页面与 SEO

| 字段 | 内容 |
|---|---|
| English URL | `/en/games/tunnel-flux` |
| 中文 URL | `/zh/games/tunnel-flux` |
| 中文显示名 | `极速隧道` |
| 中文主关键词 | `在线 3D 隧道躲避游戏` |
| 中文 SEO Title | `极速隧道 - 免费在线 3D 隧道躲避游戏 | {{SITE_NAME}}` |
| 中文 Meta description | `在高速霓虹隧道中绕墙移动，寻找旋转障碍上的安全开口并持续前进。无需下载，键盘和触摸都可操作。` |
| 中文 H1 | `在线玩极速隧道` |
| 中文分类 | 街机, 技巧 |
| 中文难度标签 | 较难 |
| 中文首页卡片文案 | 沿高速隧道环形移动，穿过每个安全开口，并躲开不断旋转的几何障碍。 |
| 中文图片 Alt | 极速隧道 游戏封面，沿高速隧道环形移动，穿过每个安全开口，并躲开不断旋转的几何障碍。 |

### 中文 About

极速隧道是一款以视觉判断和快速转向为核心的反应游戏。玩家沿隧道内壁环形移动，前方障碍会旋转、收缩或改变开口位置。速度逐步提高，但所有障碍都必须给出可读的预警。当前距离仅保存在页面中，刷新后会从初始速度重新开始。

### 中文玩法说明

- 使用左右方向键、A/D 或触摸拖动，沿隧道内壁移动。
- 观察前方障碍的开口并提前对齐。
- 安全穿过障碍即可增加距离和分数。
- 碰到实体障碍后本局结束。

### 中文游戏技巧

- 尽量平滑移动，不要在高速阶段频繁来回摆动。
- 优先观察距离更远的障碍轮廓。
- 旋转障碍的开口会移动，提前预判其到达位置。

### 中文 FAQ

**这是真正的 3D 游戏吗？**

可以使用 Canvas 2D 透视投影实现 3D 观感，无需加载大型 3D 引擎。

**是否有闪烁效果？**

不得使用危险的高频闪烁，并需支持减少动态效果设置。

**刷新后会继续当前距离吗？**

不会。刷新会重置距离、速度和障碍序列。

**中文相关推荐：** [斜坡冲刺](/zh/games/slope-dash)、[螺旋坠落](/zh/games/helix-drop)、[波形穿越](/zh/games/wave-rider)、[之字漂移](/zh/games/zigzag-drift)

### 本地化验收补充

- 英文页使用 `Tunnel Flux` 与 Part I/Part II 中的英文 SEO；中文页使用 `极速隧道` 与本节中文 SEO。
- 两个页面共用同一玩法实现、图片和测试规则，但按钮、HUD、结果层、教程与错误提示按当前 Locale 输出。
- 中文页 canonical 指向自身，英文页 canonical 指向自身；两页互相输出 `hreflang`。
- 在中文页面刷新、重新开始或切换语言后，不恢复任何分数、关卡或临时设置。

---

## G12 · 泡泡射手（Bubble Pop Shooter）

### 中文页面与 SEO

| 字段 | 内容 |
|---|---|
| English URL | `/en/games/bubble-pop-shooter` |
| 中文 URL | `/zh/games/bubble-pop-shooter` |
| 中文显示名 | `泡泡射手` |
| 中文主关键词 | `在线泡泡射击游戏` |
| 中文 SEO Title | `泡泡射手 - 免费在线泡泡射击游戏 | {{SITE_NAME}}` |
| 中文 Meta description | `瞄准并发射彩色泡泡，连接三个或更多同色泡泡并让悬空组合掉落。无需下载或登录，手机和电脑都可玩。` |
| 中文 H1 | `在线玩泡泡射手` |
| 中文分类 | 益智, 街机 |
| 中文难度标签 | 简单 |
| 中文首页卡片文案 | 瞄准并连接三个同色泡泡，清除组合并在泡泡墙触线前完成挑战。 |
| 中文图片 Alt | 泡泡射手 游戏封面，瞄准并连接三个同色泡泡，清除组合并在泡泡墙触线前完成挑战。 |

### 中文 About

泡泡射手是一款以瞄准和颜色匹配为核心的经典益智玩法。发射泡泡后，三个或更多相连的同色泡泡会消除，失去支撑的泡泡也会一起掉落。你需要规划反弹路线并管理新泡泡颜色，避免泡泡墙不断下降触及警戒线。

### 中文玩法说明

- 移动瞄准线，选择直接射击或利用侧墙反弹。
- 发射泡泡，使其与至少两个同色泡泡相连。
- 形成三个或更多同色组合后会立即消除。
- 连续未消除会让泡泡墙下降；触及警戒线时本局结束。

### 中文游戏技巧

- 优先击落支撑大量泡泡的连接点。
- 利用墙壁反弹攻击被前排挡住的位置。
- 观察下一颗泡泡颜色，再决定当前射击路线。

### 中文 FAQ

**泡泡必须三个相连吗？**

是的，发射后形成至少三个相连的同色泡泡才会消除。

**可以看到下一颗泡泡吗？**

可以。界面应显示下一颗颜色，便于玩家规划。

**关卡或分数会保存吗？**

不会。刷新后会重新生成泡泡布局并清空分数。

**中文相关推荐：** [方块绽放](/zh/games/block-bloom)、[彩色水排序](/zh/games/color-pour)、[螺丝拆板](/zh/games/bolt-away)、[数字合并 2048](/zh/games/number-merge-2048)

### 本地化验收补充

- 英文页使用 `Bubble Pop Shooter` 与 Part I/Part II 中的英文 SEO；中文页使用 `泡泡射手` 与本节中文 SEO。
- 两个页面共用同一玩法实现、图片和测试规则，但按钮、HUD、结果层、教程与错误提示按当前 Locale 输出。
- 中文页 canonical 指向自身，英文页 canonical 指向自身；两页互相输出 `hreflang`。
- 在中文页面刷新、重新开始或切换语言后，不恢复任何分数、关卡或临时设置。

---

## G13 · 螺丝拆板（Bolt Away）

### 中文页面与 SEO

| 字段 | 内容 |
|---|---|
| English URL | `/en/games/bolt-away` |
| 中文 URL | `/zh/games/bolt-away` |
| 中文显示名 | `螺丝拆板` |
| 中文主关键词 | `在线螺丝解谜游戏` |
| 中文 SEO Title | `螺丝拆板 - 免费在线螺丝解谜游戏 | {{SITE_NAME}}` |
| 中文 Meta description | `按正确顺序拧下螺丝，释放层叠板件并管理有限的临时孔位。原创关卡纯前端运行，刷新后回到第一关。` |
| 中文 H1 | `在线玩螺丝拆板` |
| 中文分类 | 益智, 技巧 |
| 中文难度标签 | 中等 |
| 中文首页卡片文案 | 按顺序取下螺丝，释放相互覆盖的板件，并避免临时孔位全部被占满。 |
| 中文图片 Alt | 螺丝拆板 游戏封面，按顺序取下螺丝，释放相互覆盖的板件，并避免临时孔位全部被占满。 |

### 中文 About

螺丝拆板是一款围绕顺序与空间关系设计的机械解谜游戏。每颗螺丝可能固定一块或多块板件，移除后板件会根据支撑状态移动或掉落。临时孔位数量有限，因此不能只看当前可拆螺丝，还要为后续步骤保留空间。所有关卡均保存在前端文件中。

### 中文玩法说明

- 选择当前允许拆除的螺丝。
- 被解除全部固定的板件会移动或从场景中释放。
- 暂时无法归位的螺丝会占用顶部临时孔位。
- 在孔位耗尽前释放所有板件即可完成关卡。

### 中文游戏技巧

- 先找只固定一块板件的螺丝，减少连锁变化。
- 注意被其他板件遮挡的孔位和螺丝。
- 临时孔位剩余较少时，不要连续拆除同类但暂时无处安放的螺丝。

### 中文 FAQ

**关卡会使用真实机械结构吗？**

玩法采用抽象化板件和固定关系，不声称模拟真实工程装配。

**失败后可以立即重试吗？**

可以。重试恢复当前关卡的初始布局；刷新则回到第一关。

**关卡数据需要数据库吗？**

不需要。关卡以静态 TypeScript 或 JSON 文件随项目构建。

**中文相关推荐：** [彩色水排序](/zh/games/color-pour)、[滑块解围](/zh/games/unblock-path)、[方块绽放](/zh/games/block-bloom)、[经典纸牌接龙](/zh/games/classic-solitaire)

### 本地化验收补充

- 英文页使用 `Bolt Away` 与 Part I/Part II 中的英文 SEO；中文页使用 `螺丝拆板` 与本节中文 SEO。
- 两个页面共用同一玩法实现、图片和测试规则，但按钮、HUD、结果层、教程与错误提示按当前 Locale 输出。
- 中文页 canonical 指向自身，英文页 canonical 指向自身；两页互相输出 `hreflang`。
- 在中文页面刷新、重新开始或切换语言后，不恢复任何分数、关卡或临时设置。

---

## G14 · 滑块解围（Unblock Path）

### 中文页面与 SEO

| 字段 | 内容 |
|---|---|
| English URL | `/en/games/unblock-path` |
| 中文 URL | `/zh/games/unblock-path` |
| 中文显示名 | `滑块解围` |
| 中文主关键词 | `在线滑块解谜游戏` |
| 中文 SEO Title | `滑块解围 - 免费在线滑块解谜游戏 | {{SITE_NAME}}` |
| 中文 Meta description | `移动横向和纵向方块，为高亮目标块打开通往出口的路线。原创关卡直接在浏览器运行，不需要登录或存档。` |
| 中文 H1 | `在线玩滑块解围` |
| 中文分类 | 益智, 技巧 |
| 中文难度标签 | 中等 |
| 中文首页卡片文案 | 移动横向与纵向方块，为高亮目标块清出一条通往出口的路线。 |
| 中文图片 Alt | 滑块解围 游戏封面，移动横向与纵向方块，为高亮目标块清出一条通往出口的路线。 |

### 中文 About

滑块解围是一款规则清晰的空间规划谜题。横向方块只能左右移动，纵向方块只能上下移动，你需要在有限棋盘中逐步腾出通道，让目标块抵达出口。关卡和最优步数保存在静态前端数据中，玩家进度不会写入任何存储。

### 中文玩法说明

- 拖动或选择一个方块，沿它允许的方向移动。
- 方块不能穿过其他方块，也不能超出棋盘。
- 调整阻挡方块的位置，为高亮目标块打开通道。
- 把目标块移动到出口即可完成当前关卡。

### 中文游戏技巧

- 先判断真正挡住出口的关键方块，而不是随意移动所有方块。
- 部分方块需要先远离出口，才能为其他方块腾出空间。
- 关注每一步是否让目标块获得更多可移动距离。

### 中文 FAQ

**方块可以旋转吗？**

不能。每个方块的方向在关卡开始时固定。

**是否显示步数？**

可以显示当前步数和关卡参考步数，但不保存历史成绩。

**刷新后会继续当前关卡吗？**

不会。刷新页面后回到第一关。

**中文相关推荐：** [螺丝拆板](/zh/games/bolt-away)、[彩色水排序](/zh/games/color-pour)、[数字合并 2048](/zh/games/number-merge-2048)、[经典纸牌接龙](/zh/games/classic-solitaire)

### 本地化验收补充

- 英文页使用 `Unblock Path` 与 Part I/Part II 中的英文 SEO；中文页使用 `滑块解围` 与本节中文 SEO。
- 两个页面共用同一玩法实现、图片和测试规则，但按钮、HUD、结果层、教程与错误提示按当前 Locale 输出。
- 中文页 canonical 指向自身，英文页 canonical 指向自身；两页互相输出 `hreflang`。
- 在中文页面刷新、重新开始或切换语言后，不恢复任何分数、关卡或临时设置。

---

## G15 · 波形穿越（Wave Rider）

### 中文页面与 SEO

| 字段 | 内容 |
|---|---|
| English URL | `/en/games/wave-rider` |
| 中文 URL | `/zh/games/wave-rider` |
| 中文显示名 | `波形穿越` |
| 中文主关键词 | `在线单键躲避游戏` |
| 中文 SEO Title | `波形穿越 - 免费在线单键躲避游戏 | {{SITE_NAME}}` |
| 中文 Meta description | `按住上升、松开下降，控制尖锐波形穿过原创几何障碍。只需一个按键，适合电脑和手机浏览器快速挑战。` |
| 中文 H1 | `在线玩波形穿越` |
| 中文分类 | 街机, 技巧 |
| 中文难度标签 | 较难 |
| 中文首页卡片文案 | 按住让波形上升，松开使其下降，在狭窄几何通道中保持精准路线。 |
| 中文图片 Alt | 波形穿越 游戏封面，按住让波形上升，松开使其下降，在狭窄几何通道中保持精准路线。 |

### 中文 About

波形穿越是一款用一个按键控制垂直方向的高速技巧游戏。按住时轨迹向上，松开时轨迹向下，水平移动会自动进行。障碍通道逐渐变窄，速度也会提高，因此玩家需要保持稳定节奏而不是连续乱点。刷新页面后距离与关卡进度全部重置。

### 中文玩法说明

- 按住鼠标、触摸屏或空格键，让波形向上移动。
- 松开输入，让波形向下移动。
- 在自动向前移动时穿过几何通道，避免碰到边界。
- 碰撞后本局结束，可立即重新开始。

### 中文游戏技巧

- 使用短按和短松形成小幅修正，比长时间按住更精确。
- 观察通道中线，避免贴着上下边缘飞行。
- 提前适应下一段坡度，不要等到进入狭窄口再调整。

### 中文 FAQ

**游戏只有一个按键吗？**

是的，核心玩法只使用按住与松开两种状态。

**关卡是无限的吗？**

可以采用若干原创片段循环组合，直到玩家碰撞。

**是否支持减少动态效果？**

支持。界面动画与背景效果需要遵循系统的减少动态设置。

**中文相关推荐：** [极速隧道](/zh/games/tunnel-flux)、[斜坡冲刺](/zh/games/slope-dash)、[钩索摆荡](/zh/games/hook-swing)、[之字漂移](/zh/games/zigzag-drift)

### 本地化验收补充

- 英文页使用 `Wave Rider` 与 Part I/Part II 中的英文 SEO；中文页使用 `波形穿越` 与本节中文 SEO。
- 两个页面共用同一玩法实现、图片和测试规则，但按钮、HUD、结果层、教程与错误提示按当前 Locale 输出。
- 中文页 canonical 指向自身，英文页 canonical 指向自身；两页互相输出 `hreflang`。
- 在中文页面刷新、重新开始或切换语言后，不恢复任何分数、关卡或临时设置。

---

## G16 · 水果切割冲刺（Fruit Slice Rush）

### 中文页面与 SEO

| 字段 | 内容 |
|---|---|
| English URL | `/en/games/fruit-slice-rush` |
| 中文 URL | `/zh/games/fruit-slice-rush` |
| 中文显示名 | `水果切割冲刺` |
| 中文主关键词 | `在线切水果小游戏` |
| 中文 SEO Title | `水果切割冲刺 - 免费在线切水果小游戏 | {{SITE_NAME}}` |
| 中文 Meta description | `滑动切开飞起的水果，连续命中形成组合，同时避开危险球。支持鼠标和触摸操作，刷新后重新开始一局。` |
| 中文 H1 | `在线玩水果切割冲刺` |
| 中文分类 | 街机, 技巧 |
| 中文难度标签 | 简单 |
| 中文首页卡片文案 | 滑动切开飞起的水果，积累连续组合，并避开混在其中的黑色危险球。 |
| 中文图片 Alt | 水果切割冲刺 游戏封面，滑动切开飞起的水果，积累连续组合，并避开混在其中的黑色危险球。 |

### 中文 About

水果切割冲刺是一款面向鼠标与触摸屏的快速反应游戏。水果会以不同角度和速度从底部飞出，玩家通过连续划动完成切割。一次划过多个水果可形成组合，但碰到危险球会立即受到惩罚或结束本局。所有分数与连击在刷新后清空。

### 中文玩法说明

- 按住并拖动鼠标，或在触摸屏上滑动形成切割轨迹。
- 轨迹穿过水果时会将其切开并增加分数。
- 一次连续划动命中多个水果可获得组合奖励。
- 避免碰到黑色危险球，并尽量不要漏掉过多水果。

### 中文游戏技巧

- 等待多个水果靠近后再划出一条完整轨迹。
- 看到危险球时缩短滑动距离，避免误触。
- 从水果运动方向的前方切入，更容易连续命中。

### 中文 FAQ

**游戏里会出现真实品牌或角色吗？**

不会。水果、特效和危险物全部使用原创通用美术。

**漏掉水果会怎样？**

连续漏掉一定数量后本局结束，具体阈值应在界面中说明。

**触摸屏是否支持多指？**

首版只处理单指主轨迹，额外触点应被安全忽略。

**中文相关推荐：** [点击投篮](/zh/games/tap-hoops)、[霓虹贪吃蛇](/zh/games/neon-snake)、[波形穿越](/zh/games/wave-rider)、[天空叠塔](/zh/games/sky-stack)

### 本地化验收补充

- 英文页使用 `Fruit Slice Rush` 与 Part I/Part II 中的英文 SEO；中文页使用 `水果切割冲刺` 与本节中文 SEO。
- 两个页面共用同一玩法实现、图片和测试规则，但按钮、HUD、结果层、教程与错误提示按当前 Locale 输出。
- 中文页 canonical 指向自身，英文页 canonical 指向自身；两页互相输出 `hreflang`。
- 在中文页面刷新、重新开始或切换语言后，不恢复任何分数、关卡或临时设置。

---

## G17 · 钩索摆荡（Hook Swing）

### 中文页面与 SEO

| 字段 | 内容 |
|---|---|
| English URL | `/en/games/hook-swing` |
| 中文 URL | `/zh/games/hook-swing` |
| 中文显示名 | `钩索摆荡` |
| 中文主关键词 | `在线钩索摆荡小游戏` |
| 中文 SEO Title | `钩索摆荡 - 免费在线钩索技巧小游戏 | {{SITE_NAME}}` |
| 中文 Meta description | `连接锚点、借助惯性摆荡并在合适时机松开，穿过原创障碍抵达终点。支持键盘、鼠标与触摸操作。` |
| 中文 H1 | `在线玩钩索摆荡` |
| 中文分类 | 街机, 技巧 |
| 中文难度标签 | 中等 |
| 中文首页卡片文案 | 连接锚点，在摆到高点时松开，并借助惯性把小小探险者送到终点。 |
| 中文图片 Alt | 钩索摆荡 游戏封面，连接锚点，在摆到高点时松开，并借助惯性把小小探险者送到终点。 |

### 中文 About

钩索摆荡是一款基于摆动惯性和释放时机的物理技巧游戏。角色靠近有效锚点时可以连接绳索，随后围绕锚点摆动；在合适角度松开，就能飞向下一处锚点或终点。关卡数据保存在前端，刷新页面后会回到第一关。

### 中文玩法说明

- 按住或点击可用锚点连接钩索。
- 保持连接，让角色围绕锚点摆动并积累速度。
- 在合适角度松开，借助惯性飞向下一锚点。
- 避开障碍并触碰终点区域完成关卡。

### 中文游戏技巧

- 通常在摆动接近最高点前松开，可以获得更远的水平距离。
- 不要连接距离过远或角度不利的锚点。
- 需要精确落点时，先用短摆动降低速度。

### 中文 FAQ

**需要实时网络或多人服务器吗？**

不需要。物理计算与关卡全部在浏览器本地运行。

**关卡失败后会保存位置吗？**

不会。重试回到当前关卡起点，刷新回到第一关。

**为什么使用物理库？**

可只在该游戏的异步代码块中加载轻量物理库，避免影响首页性能。

**中文相关推荐：** [陷阱跑者](/zh/games/trap-runner)、[崎岖车轮](/zh/games/rugged-wheels)、[波形穿越](/zh/games/wave-rider)、[斜坡冲刺](/zh/games/slope-dash)

### 本地化验收补充

- 英文页使用 `Hook Swing` 与 Part I/Part II 中的英文 SEO；中文页使用 `钩索摆荡` 与本节中文 SEO。
- 两个页面共用同一玩法实现、图片和测试规则，但按钮、HUD、结果层、教程与错误提示按当前 Locale 输出。
- 中文页 canonical 指向自身，英文页 canonical 指向自身；两页互相输出 `hreflang`。
- 在中文页面刷新、重新开始或切换语言后，不恢复任何分数、关卡或临时设置。

---

## G18 · 陷阱跑者（Trap Runner）

### 中文页面与 SEO

| 字段 | 内容 |
|---|---|
| English URL | `/en/games/trap-runner` |
| 中文 URL | `/zh/games/trap-runner` |
| 中文显示名 | `陷阱跑者` |
| 中文主关键词 | `在线陷阱闯关游戏` |
| 中文 SEO Title | `陷阱跑者 - 免费在线平台陷阱闯关游戏 | {{SITE_NAME}}` |
| 中文 Meta description | `奔跑、跳跃并记住会变化的地板与机关，在短小原创房间中逐步找到安全路线。无血腥表现，刷新后回到第一关。` |
| 中文 H1 | `在线玩陷阱跑者` |
| 中文分类 | 街机, 技巧 |
| 中文难度标签 | 较难 |
| 中文首页卡片文案 | 穿过会移动的地板、突然出现的尖刺和可学习的机关，完成一间间短平台关卡。 |
| 中文图片 Alt | 陷阱跑者 游戏封面，穿过会移动的地板、突然出现的尖刺和可学习的机关，完成一间间短平台关卡。 |

### 中文 About

陷阱跑者是一款通过观察与重复尝试学习规则的平台游戏。部分地板会移动，机关会在接近时触发，终点前也可能出现新的变化；但所有陷阱都必须保持一致、可预判，不允许依赖纯随机恶意失败。游戏使用非血腥表现，刷新页面后从第一关开始。

### 中文玩法说明

- 使用方向键或 A/D 移动，按空格、W 或屏幕按钮跳跃。
- 观察地板、标记和机关的触发规律。
- 失败后快速重试当前房间，并利用上一次获得的信息。
- 到达出口即可进入下一关。

### 中文游戏技巧

- 不要一直全速前进，在可疑地面前先小步试探。
- 记住触发位置，而不只是记住陷阱出现后的画面。
- 有些机关需要先触发，再退回安全区域等待。

### 中文 FAQ

**陷阱会随机变化吗？**

同一关的核心机关必须保持一致，玩家可以通过学习完成，而不是碰运气。

**游戏包含血腥内容吗？**

不包含。失败使用柔和的动画、粒子或重置效果。

**进度会保存吗？**

不会。刷新页面后回到第一关。

**中文相关推荐：** [钩索摆荡](/zh/games/hook-swing)、[崎岖车轮](/zh/games/rugged-wheels)、[波形穿越](/zh/games/wave-rider)、[霓虹贪吃蛇](/zh/games/neon-snake)

### 本地化验收补充

- 英文页使用 `Trap Runner` 与 Part I/Part II 中的英文 SEO；中文页使用 `陷阱跑者` 与本节中文 SEO。
- 两个页面共用同一玩法实现、图片和测试规则，但按钮、HUD、结果层、教程与错误提示按当前 Locale 输出。
- 中文页 canonical 指向自身，英文页 canonical 指向自身；两页互相输出 `hreflang`。
- 在中文页面刷新、重新开始或切换语言后，不恢复任何分数、关卡或临时设置。

---

## G19 · 崎岖车轮（Rugged Wheels）

### 中文页面与 SEO

| 字段 | 内容 |
|---|---|
| English URL | `/en/games/rugged-wheels` |
| 中文 URL | `/zh/games/rugged-wheels` |
| 中文显示名 | `崎岖车轮` |
| 中文主关键词 | `在线物理小车游戏` |
| 中文 SEO Title | `崎岖车轮 - 免费在线物理小车闯关游戏 | {{SITE_NAME}}` |
| 中文 Meta description | `控制两轮小车前进、后退与保持平衡，穿过斜坡、桥梁和移动障碍。原创赛道纯前端运行，刷新后回到第一关。` |
| 中文 H1 | `在线玩崎岖车轮` |
| 中文分类 | 街机, 技巧 |
| 中文难度标签 | 中等 |
| 中文首页卡片文案 | 保持两轮小车平衡，穿过坡道、桥梁、颠簸地面和不断变化的障碍。 |
| 中文图片 Alt | 崎岖车轮 游戏封面，保持两轮小车平衡，穿过坡道、桥梁、颠簸地面和不断变化的障碍。 |

### 中文 About

崎岖车轮是一款强调油门与重心控制的物理驾驶游戏。车辆在斜坡、桥梁和不平路面上会产生明显的倾斜与弹跳，玩家需要在前进速度和车身姿态之间做出平衡。关卡与检查点存放在静态文件中，不需要数据库；刷新后会回到第一关。

### 中文玩法说明

- 使用前进和后退按键，或屏幕左右控制区驱动车辆。
- 通过加速与反向输入调整车身角度。
- 越过坡道、桥梁和移动障碍，避免车辆翻转或坠落。
- 抵达终点标记即可完成当前关卡。

### 中文游戏技巧

- 上陡坡前保持适中速度，过快容易抬头翻车。
- 车辆离地时用轻微反向输入修正角度。
- 移动桥梁前先观察周期，不必一直踩住前进。

### 中文 FAQ

**游戏里会出现真实汽车品牌吗？**

不会。车辆外观、名称和声音都使用原创通用设计。

**翻车后从哪里开始？**

可从当前关卡的最近检查点重试；刷新后回到第一关。

**需要后端物理计算吗？**

不需要。所有物理模拟都在浏览器中完成。

**中文相关推荐：** [钩索摆荡](/zh/games/hook-swing)、[陷阱跑者](/zh/games/trap-runner)、[之字漂移](/zh/games/zigzag-drift)、[斜坡冲刺](/zh/games/slope-dash)

### 本地化验收补充

- 英文页使用 `Rugged Wheels` 与 Part I/Part II 中的英文 SEO；中文页使用 `崎岖车轮` 与本节中文 SEO。
- 两个页面共用同一玩法实现、图片和测试规则，但按钮、HUD、结果层、教程与错误提示按当前 Locale 输出。
- 中文页 canonical 指向自身，英文页 canonical 指向自身；两页互相输出 `hreflang`。
- 在中文页面刷新、重新开始或切换语言后，不恢复任何分数、关卡或临时设置。

---

## G20 · 经典纸牌接龙（Classic Solitaire）

### 中文页面与 SEO

| 字段 | 内容 |
|---|---|
| English URL | `/en/games/classic-solitaire` |
| 中文 URL | `/zh/games/classic-solitaire` |
| 中文显示名 | `经典纸牌接龙` |
| 中文主关键词 | `在线纸牌接龙` |
| 中文 SEO Title | `经典纸牌接龙 - 免费在线 Klondike 接龙 | {{SITE_NAME}}` |
| 中文 Meta description | `免费玩翻一张模式的 Klondike 纸牌接龙，支持点击、拖动、触摸和撤销。无需注册，不保存胜率或历史牌局。` |
| 中文 H1 | `在线玩经典纸牌接龙` |
| 中文分类 | 益智 |
| 中文难度标签 | 经典 |
| 中文首页卡片文案 | 体验简洁的翻一张 Klondike 接龙，支持点击、拖动、触摸与当前牌局撤销。 |
| 中文图片 Alt | 经典纸牌接龙 游戏封面，体验简洁的翻一张 Klondike 接龙，支持点击、拖动、触摸与当前牌局撤销。 |

### 中文 About

经典纸牌接龙采用翻一张的 Klondike 规则。你需要在七列牌堆间按红黑交替、数字递减的方式整理纸牌，并把同花色从 A 到 K 移入基础牌堆。洗牌、牌局与撤销历史只存在于当前页面，刷新后会获得一副全新的牌。

### 中文玩法说明

- 在桌面牌列中按红黑交替、点数递减的顺序移动纸牌。
- 只有 K 或以 K 开头的序列可以移动到空列。
- 把 A 放入基础牌堆，并按同花色从 A 依次叠到 K。
- 点击牌库翻出下一张牌，完成四个基础牌堆即可获胜。

### 中文游戏技巧

- 优先翻开被盖住的牌，而不是只移动表面可见牌。
- 不要过早把所有低点数牌移入基础堆，以免阻塞桌面调整。
- 空列非常宝贵，尽量用于移动较长的 K 开头序列。

### 中文 FAQ

**使用翻一张还是翻三张规则？**

首版采用翻一张规则，降低上手门槛并便于触摸操作。

**可以撤销吗？**

可以撤销当前牌局中的操作，但记录不会在刷新后保留。

**会统计胜率和连胜吗？**

不会。网站不建立账号、统计表或本地长期存储。

**中文相关推荐：** [数字合并 2048](/zh/games/number-merge-2048)、[方块绽放](/zh/games/block-bloom)、[彩色水排序](/zh/games/color-pour)、[滑块解围](/zh/games/unblock-path)

### 本地化验收补充

- 英文页使用 `Classic Solitaire` 与 Part I/Part II 中的英文 SEO；中文页使用 `经典纸牌接龙` 与本节中文 SEO。
- 两个页面共用同一玩法实现、图片和测试规则，但按钮、HUD、结果层、教程与错误提示按当前 Locale 输出。
- 中文页 canonical 指向自身，英文页 canonical 指向自身；两页互相输出 `hreflang`。
- 在中文页面刷新、重新开始或切换语言后，不恢复任何分数、关卡或临时设置。

---

## G21 · 数字果园（Sum Orchard）

### 中文页面与 SEO

| 字段 | 内容 |
|---|---|
| English URL | `/en/games/sum-orchard` |
| 中文 URL | `/zh/games/sum-orchard` |
| 中文显示名 | `数字果园` |
| 中文主关键词 | `在线数字求和游戏` |
| 中文 SEO Title | `数字果园 - 免费在线数字求和益智游戏 | {{SITE_NAME}}` |
| 中文 Meta description | `框选数字水果，让区域内数字之和等于目标值，并在倒计时结束前连续清除。纯前端运行，刷新后开始新棋盘。` |
| 中文 H1 | `在线玩数字果园` |
| 中文分类 | 脑力, 益智 |
| 中文难度标签 | 容易上手 |
| 中文首页卡片文案 | 框选一片数字水果，使区域总和等于目标值，并在倒计时内连续完成清除。 |
| 中文图片 Alt | 数字果园 游戏封面，框选一片数字水果，使区域总和等于目标值，并在倒计时内连续完成清除。 |

### 中文 About

数字果园是一款需要快速观察数字组合的网格谜题。拖出一个矩形后，区域内所有可见数字都会参与求和，只有总数恰好等于目标值时才能清除。空格计为零，可以帮助你连接更远的数字。每局时间有限，页面刷新后会重新生成可解棋盘。

### 中文玩法说明

- 从一个格子拖到另一个格子，形成矩形选择区域。
- 把区域内所有可见数字相加，空格按零计算。
- 当总和恰好等于当前目标时，区域内数字会被清除并得分。
- 在倒计时结束前不断寻找新的有效矩形。

### 中文游戏技巧

- 先扫描单个目标数字和简单两数组合。
- 利用已经清空的格子扩大矩形，而不增加总和。
- 释放当前选择前先观察下一处组合，便于维持连击。

### 中文 FAQ

**矩形内的数字必须相邻吗？**

不需要。矩形内所有数字都会计入，空白格不增加总和。

**目标数字会变化吗？**

首版可以在整局中保持固定目标，让快速扫描成为主要技巧。

**棋盘会保存吗？**

不会。刷新页面会生成新的棋盘并清空分数。

**可以使用键盘游玩吗？**

可以。除了鼠标与触摸拖动，棋盘也支持用键盘确定起点并扩展选择区域。

**中文相关推荐：** [色彩十字](/zh/games/color-cross)、[三色框选](/zh/games/triad-capture)、[目标数字篮](/zh/games/target-basket)、[数学方格冲刺](/zh/games/math-grid-sprint)

### 本地化验收补充

- 英文页使用 `Sum Orchard` 与 Part I/Part II 中的英文 SEO；中文页使用 `数字果园` 与本节中文 SEO。
- 两个页面共用同一玩法实现、图片和测试规则，但按钮、HUD、结果层、教程与错误提示按当前 Locale 输出。
- 中文页 canonical 指向自身，英文页 canonical 指向自身；两页互相输出 `hreflang`。
- 在中文页面刷新、重新开始或切换语言后，不恢复任何分数、关卡或临时设置。

---

## G22 · 色彩十字（Color Cross）

### 中文页面与 SEO

| 字段 | 内容 |
|---|---|
| English URL | `/en/games/color-cross` |
| 中文 URL | `/zh/games/color-cross` |
| 中文显示名 | `色彩十字` |
| 中文主关键词 | `在线颜色逻辑游戏` |
| 中文 SEO Title | `色彩十字 - 免费在线颜色逻辑益智游戏 | {{SITE_NAME}}` |
| 中文 Meta description | `点击空白格，判断上下或左右最近的色块是否形成匹配组合，并逐步清空棋盘。支持颜色与符号双重提示。` |
| 中文 H1 | `在线玩色彩十字` |
| 中文分类 | 脑力, 益智 |
| 中文难度标签 | 需要思考 |
| 中文首页卡片文案 | 选择空白位置，判断横向或纵向最近的色块能否组成匹配颜色对。 |
| 中文图片 Alt | 色彩十字 游戏封面，选择空白位置，判断横向或纵向最近的色块能否组成匹配颜色对。 |

### 中文 About

色彩十字是一款围绕空白位置进行判断的逻辑游戏。点击一个空格时，系统会向上下左右寻找最近的非空色块；当横向或纵向形成符合规则的匹配组合时，对应色块会被清除。颜色必须同时配合符号或纹理，确保不依赖单一颜色识别。

### 中文玩法说明

- 选择棋盘中的一个空白格。
- 系统寻找该位置上下左右最近的非空色块。
- 若横向或纵向两端满足匹配规则，对应色块会被清除。
- 不断制造新的空白与组合，直到完成棋盘目标或没有合法操作。

### 中文游戏技巧

- 先寻找横向和纵向都可能同时匹配的交叉位置。
- 清除外层色块可能暴露更远处的新组合。
- 同时观察符号和颜色，避免只依靠色差判断。

### 中文 FAQ

**一定要上下左右都匹配吗？**

不一定。可按规则允许横向、纵向或两者同时成立，并在界面中清楚提示。

**色盲玩家能识别棋子吗？**

可以。每种颜色都必须搭配独立符号、纹理或形状。

**棋盘是否随机生成？**

可以从可解模板生成并通过求解器验证，刷新后开始新的棋盘。

**辅助识别设置会保存吗？**

不会。辅助识别开关和全部游戏状态都会在刷新页面后重置。

**中文相关推荐：** [数字果园](/zh/games/sum-orchard)、[轨道连线](/zh/games/orbit-lines)、[星角拼图](/zh/games/corner-stars)、[回声连线](/zh/games/echo-path)

### 本地化验收补充

- 英文页使用 `Color Cross` 与 Part I/Part II 中的英文 SEO；中文页使用 `色彩十字` 与本节中文 SEO。
- 两个页面共用同一玩法实现、图片和测试规则，但按钮、HUD、结果层、教程与错误提示按当前 Locale 输出。
- 中文页 canonical 指向自身，英文页 canonical 指向自身；两页互相输出 `hreflang`。
- 在中文页面刷新、重新开始或切换语言后，不恢复任何分数、关卡或临时设置。

---

## G23 · 轨道连线（Orbit Lines）

### 中文页面与 SEO

| 字段 | 内容 |
|---|---|
| English URL | `/en/games/orbit-lines` |
| 中文 URL | `/zh/games/orbit-lines` |
| 中文显示名 | `轨道连线` |
| 中文主关键词 | `在线连珠益智游戏` |
| 中文 SEO Title | `轨道连线 - 免费在线连珠益智游戏 | {{SITE_NAME}}` |
| 中文 Meta description | `沿无阻挡直线移动圆球，在横向、纵向或斜线方向连接三个以上同类信号，并在时间结束前持续得分。` |
| 中文 H1 | `在线玩轨道连线` |
| 中文分类 | 脑力, 益智, 技巧 |
| 中文难度标签 | 策略型 |
| 中文首页卡片文案 | 沿空旷直线移动一颗圆球，在横、竖或斜线方向连接三个以上相同信号。 |
| 中文图片 Alt | 轨道连线 游戏封面，沿空旷直线移动一颗圆球，在横、竖或斜线方向连接三个以上相同信号。 |

### 中文 About

轨道连线是一款把直线移动和连珠消除结合起来的棋盘游戏。每次只能让一颗圆球沿无阻挡的横线、竖线或指定直线移动，落点形成三个或更多同类圆球时即可消除。无效移动会让棋盘增加新圆球，因此需要同时考虑当前得分与未来空间。

### 中文玩法说明

- 选择一颗圆球，再选择同一条无阻挡直线上的空格。
- 圆球沿直线移动到目标位置。
- 若落点形成至少三个同类圆球的横线、竖线或斜线，它们会被清除。
- 没有形成组合时，棋盘会加入新的圆球；填满或时间结束后本局结束。

### 中文游戏技巧

- 移动前先确认路径中没有其他圆球阻挡。
- 优先准备一次移动即可完成的两端开放组合。
- 不要只追求当前三连，给较长连线保留空间会获得更高分。

### 中文 FAQ

**圆球可以转弯移动吗？**

不能。一次移动必须沿清晰、无阻挡的直线完成。

**斜线是否计分？**

计分。横向、纵向和规则允许的对角线都可以形成组合。

**刷新后会保留棋盘吗？**

不会。棋盘、计时和分数都会重置。

**移动后没有形成连线会怎样？**

棋盘会加入新的圆球，因此每次没有消除的移动都需要为后续空间留出余地。

**中文相关推荐：** [色彩十字](/zh/games/color-cross)、[星角拼图](/zh/games/corner-stars)、[侧落方块](/zh/games/sidefall-blocks)、[回声连线](/zh/games/echo-path)

### 本地化验收补充

- 英文页使用 `Orbit Lines` 与 Part I/Part II 中的英文 SEO；中文页使用 `轨道连线` 与本节中文 SEO。
- 两个页面共用同一玩法实现、图片和测试规则，但按钮、HUD、结果层、教程与错误提示按当前 Locale 输出。
- 中文页 canonical 指向自身，英文页 canonical 指向自身；两页互相输出 `hreflang`。
- 在中文页面刷新、重新开始或切换语言后，不恢复任何分数、关卡或临时设置。

---

## G24 · 星角拼图（Corner Stars）

### 中文页面与 SEO

| 字段 | 内容 |
|---|---|
| English URL | `/en/games/corner-stars` |
| 中文 URL | `/zh/games/corner-stars` |
| 中文显示名 | `星角拼图` |
| 中文主关键词 | `在线 L 形几何拼图` |
| 中文 SEO Title | `星角拼图 - 免费在线 L 形几何益智游戏 | {{SITE_NAME}}` |
| 中文 Meta description | `选择三颗相同星星，让它们组成两条等长直角边，并确保边线上没有其他星星阻挡。浏览器中直接免费游玩。` |
| 中文 H1 | `在线玩星角拼图` |
| 中文分类 | 脑力, 益智 |
| 中文难度标签 | 空间推理 |
| 中文首页卡片文案 | 找出三颗相同星星，使它们组成等臂直角，并确保两条边之间没有阻挡。 |
| 中文图片 Alt | 星角拼图 游戏封面，找出三颗相同星星，使它们组成等臂直角，并确保两条边之间没有阻挡。 |

### 中文 About

星角拼图是一款把颜色匹配与几何判断结合起来的益智游戏。三颗相同星星必须由一个直角顶点和两个端点组成，两条直角边长度相等，并且边线上不能存在阻挡星星。规则适合使用 SVG 清晰绘制选择关系，同时提供键盘选择路径。

### 中文玩法说明

- 依次选择三颗符号或颜色相同的星星。
- 其中一颗必须成为直角顶点，另外两颗位于互相垂直的方向。
- 两条直角边的格距必须相等，边线上不能被其他星星阻挡。
- 有效组合会被清除并获得分数，继续寻找下一组。

### 中文游戏技巧

- 先找拥有同类水平邻居和垂直邻居的候选顶点。
- 注意距离不仅要方向垂直，还必须完全相等。
- 清除靠近中心的组合通常会暴露更多可能角形。

### 中文 FAQ

**三个点只要形成直角就可以吗？**

还不够。两条直角边必须等长，并满足无遮挡要求。

**颜色是唯一判断方式吗？**

不是。每类星星还要使用不同符号或纹理。

**可以用键盘选择吗？**

可以。焦点可在星星间移动，并通过确认键依次选择三点。

**重排次数会保存吗？**

不会。刷新后棋盘、重排次数、分数与计时都会重置。

**中文相关推荐：** [轨道连线](/zh/games/orbit-lines)、[色彩十字](/zh/games/color-cross)、[三色框选](/zh/games/triad-capture)、[回声连线](/zh/games/echo-path)

### 本地化验收补充

- 英文页使用 `Corner Stars` 与 Part I/Part II 中的英文 SEO；中文页使用 `星角拼图` 与本节中文 SEO。
- 两个页面共用同一玩法实现、图片和测试规则，但按钮、HUD、结果层、教程与错误提示按当前 Locale 输出。
- 中文页 canonical 指向自身，英文页 canonical 指向自身；两页互相输出 `hreflang`。
- 在中文页面刷新、重新开始或切换语言后，不恢复任何分数、关卡或临时设置。

---

## G25 · 侧落方块（Sidefall Blocks）

### 中文页面与 SEO

| 字段 | 内容 |
|---|---|
| English URL | `/en/games/sidefall-blocks` |
| 中文 URL | `/zh/games/sidefall-blocks` |
| 中文显示名 | `侧落方块` |
| 中文主关键词 | `在线方块下落游戏` |
| 中文 SEO Title | `侧落方块 - 免费在线方块下落益智游戏 | {{SITE_NAME}}` |
| 中文 Meta description | `横向移动列顶的暴露方块，让它在目标列中下落并连接同色组合。规划重力与连锁，刷新后开始新棋盘。` |
| 中文 H1 | `在线玩侧落方块` |
| 中文分类 | 益智, 技巧 |
| 中文难度标签 | 战术规划 |
| 中文首页卡片文案 | 把暴露方块移到另一列后释放，让重力落下并组成更大的同色连通组。 |
| 中文图片 Alt | 侧落方块 游戏封面，把暴露方块移到另一列后释放，让重力落下并组成更大的同色连通组。 |

### 中文 About

侧落方块是一款先横移、再下落的重力拼图。玩家只能操作当前暴露的方块，把它移到另一列上方后释放；方块落入最低可用位置，形成足够大的同色连通组时即可清除。一次移动会改变多列高度，因此需要提前判断连锁和可操作空间。

### 中文玩法说明

- 选择当前允许移动的暴露方块。
- 将它横向移动到目标列上方。
- 释放后方块会在重力作用下落到该列最低空位。
- 形成达到阈值的同色连通组后会清除并触发可能的连锁。

### 中文游戏技巧

- 不要只看目标列顶部，还要考虑落下后的最终位置。
- 优先把孤立色块连接到已有大组。
- 连锁清除可能改变多列高度，移动前先预测第二次落点。

### 中文 FAQ

**所有方块都可以移动吗？**

不能。只有规则指定的暴露方块可以横向移动。

**同色方块必须排成直线吗？**

不必，按上下左右相连形成的连通组即可。

**游戏需要保存关卡吗？**

不需要。棋盘与分数只存在于当前页面。

**游戏会记住最佳连锁吗？**

不会。所有对局统计都只在当前页面中临时保留，刷新后会重置。

**中文相关推荐：** [轨道连线](/zh/games/orbit-lines)、[三色框选](/zh/games/triad-capture)、[色彩十字](/zh/games/color-cross)、[数字果园](/zh/games/sum-orchard)

### 本地化验收补充

- 英文页使用 `Sidefall Blocks` 与 Part I/Part II 中的英文 SEO；中文页使用 `侧落方块` 与本节中文 SEO。
- 两个页面共用同一玩法实现、图片和测试规则，但按钮、HUD、结果层、教程与错误提示按当前 Locale 输出。
- 中文页 canonical 指向自身，英文页 canonical 指向自身；两页互相输出 `hreflang`。
- 在中文页面刷新、重新开始或切换语言后，不恢复任何分数、关卡或临时设置。

---

## G26 · 三色框选（Triad Capture）

### 中文页面与 SEO

| 字段 | 内容 |
|---|---|
| English URL | `/en/games/triad-capture` |
| 中文 URL | `/zh/games/triad-capture` |
| 中文显示名 | `三色框选` |
| 中文主关键词 | `在线三色消除游戏` |
| 中文 SEO Title | `三色框选 - 免费在线三色消除益智游戏 | {{SITE_NAME}}` |
| 中文 Meta description | `框选数量相等的三种符号，例如各一个、各两个或更多，即可完成平衡消除并积累连击。支持触摸与键盘。` |
| 中文 H1 | `在线玩三色框选` |
| 中文分类 | 脑力, 益智 |
| 中文难度标签 | 快速思考 |
| 中文首页卡片文案 | 框住数量完全相等的三种符号，把平衡组合转化为消除与连续得分。 |
| 中文图片 Alt | 三色框选 游戏封面，框住数量完全相等的三种符号，把平衡组合转化为消除与连续得分。 |

### 中文 About

三色框选要求玩家在矩形区域内保持三种符号数量完全相等。有效区域可以是每种一个、每种两个或更大的平衡组合，区域越大通常奖励越高。清除后不会保存棋盘或成绩，刷新页面会生成一盘新的可解布局。

### 中文玩法说明

- 拖动形成一个轴对齐的矩形选择区域。
- 统计区域内三种符号各自的数量。
- 当三种数量相等且不全为零时，区域内符号会被清除并得分。
- 快速连续完成有效框选可增加连击奖励。

### 中文游戏技巧

- 先寻找每种一个的最小组合，再观察是否能扩大区域。
- 空白格不会改变数量，可用于连接分散符号。
- 选择前先分别计数三种符号，避免只凭视觉面积判断。

### 中文 FAQ

**必须每种只有一个吗？**

不必。只要三种符号数量完全相等即可。

**空白格会影响判断吗？**

不会。空白格计为零，但仍属于矩形范围。

**颜色辨识困难怎么办？**

每种类型必须同时使用独立图形和文字辅助说明。

**连击会保存吗？**

不会。连击只属于当前一局，刷新或重新开始后会消失。

**中文相关推荐：** [数字果园](/zh/games/sum-orchard)、[色彩十字](/zh/games/color-cross)、[侧落方块](/zh/games/sidefall-blocks)、[星角拼图](/zh/games/corner-stars)

### 本地化验收补充

- 英文页使用 `Triad Capture` 与 Part I/Part II 中的英文 SEO；中文页使用 `三色框选` 与本节中文 SEO。
- 两个页面共用同一玩法实现、图片和测试规则，但按钮、HUD、结果层、教程与错误提示按当前 Locale 输出。
- 中文页 canonical 指向自身，英文页 canonical 指向自身；两页互相输出 `hreflang`。
- 在中文页面刷新、重新开始或切换语言后，不恢复任何分数、关卡或临时设置。

---

## G27 · 回声连线（Echo Path）

### 中文页面与 SEO

| 字段 | 内容 |
|---|---|
| English URL | `/en/games/echo-path` |
| 中文 URL | `/zh/games/echo-path` |
| 中文显示名 | `回声连线` |
| 中文主关键词 | `在线路径连接游戏` |
| 中文 SEO Title | `回声连线 - 免费在线路径连接益智游戏 | {{SITE_NAME}}` |
| 中文 Meta description | `连接相同端点，路径中间只能使用同一种其他符号，并且不能经过已经占用的格子。逐步规划并清空棋盘。` |
| 中文 H1 | `在线玩回声连线` |
| 中文分类 | 脑力, 益智 |
| 中文难度标签 | 具有挑战 |
| 中文首页卡片文案 | 用一种统一的中间符号连接相同端点，同时避开已经被其他路径占用的格子。 |
| 中文图片 Alt | 回声连线 游戏封面，用一种统一的中间符号连接相同端点，同时避开已经被其他路径占用的格子。 |

### 中文 About

回声连线是一款强调路径规划和资源占用的逻辑游戏。每条路径从两个相同端点开始，中间经过的格子必须全部属于另一种统一符号；完成后整条路径会永久占用这些格子，影响后续连接。玩家需要决定先后顺序，避免早期路径堵死剩余端点。

### 中文玩法说明

- 选择一个端点并沿相邻格子绘制路径。
- 路径终点必须是与起点相同的符号。
- 中间格子只能使用一种统一的其他符号，并且不能重复或穿过已占用格。
- 成功连接后路径固定，继续完成剩余端点。

### 中文游戏技巧

- 先处理可选路线最少的端点对。
- 长路径可能封锁棋盘中央，绘制前先检查剩余通道。
- 利用边缘路线，为中心区域保留更灵活的连接空间。

### 中文 FAQ

**路径可以交叉吗？**

不能。已完成路径会占用格子，其他路径不得穿过。

**中间可以混用多种符号吗？**

不能。一条路径的所有中间格必须属于同一种符号类型。

**画错后可以撤销吗？**

可以在当前会话中撤销或重置关卡，但不会跨刷新保存。

**重新开始会恢复原来的棋盘吗？**

不会。重新开始会在内存中生成新棋盘，刷新页面也会开启全新一局。

**中文相关推荐：** [色彩十字](/zh/games/color-cross)、[星角拼图](/zh/games/corner-stars)、[轨道连线](/zh/games/orbit-lines)、[数学方格冲刺](/zh/games/math-grid-sprint)

### 本地化验收补充

- 英文页使用 `Echo Path` 与 Part I/Part II 中的英文 SEO；中文页使用 `回声连线` 与本节中文 SEO。
- 两个页面共用同一玩法实现、图片和测试规则，但按钮、HUD、结果层、教程与错误提示按当前 Locale 输出。
- 中文页 canonical 指向自身，英文页 canonical 指向自身；两页互相输出 `hreflang`。
- 在中文页面刷新、重新开始或切换语言后，不恢复任何分数、关卡或临时设置。

---

## G28 · 目标数字篮（Target Basket）

### 中文页面与 SEO

| 字段 | 内容 |
|---|---|
| English URL | `/en/games/target-basket` |
| 中文 URL | `/zh/games/target-basket` |
| 中文显示名 | `目标数字篮` |
| 中文主关键词 | `在线两数求和游戏` |
| 中文 SEO Title | `目标数字篮 - 免费在线两数求和小游戏 | {{SITE_NAME}}` |
| 中文 Meta description | `选择两个数字水果，使它们的和等于篮子上的目标值，在时间内完成连续回合。适合快速练习加法与观察。` |
| 中文 H1 | `在线玩目标数字篮` |
| 中文分类 | 脑力, 技巧 |
| 中文难度标签 | 适合一般受众 |
| 中文首页卡片文案 | 选择两个数字水果，让它们的和等于目标篮数字，并在回合计时结束前完成配对。 |
| 中文图片 Alt | 目标数字篮 游戏封面，选择两个数字水果，让它们的和等于目标篮数字，并在回合计时结束前完成配对。 |

### 中文 About

目标数字篮是一款规则直接的两数求和小游戏。每回合显示一个目标值和一组数字水果，玩家需要选出恰好两个数字，使它们相加等于目标。完成后立即进入下一回合，数字范围和干扰项逐步变化。成绩只在当前页面显示。

### 中文玩法说明

- 查看篮子上显示的目标数字。
- 从场景中选择第一个数字水果，再选择第二个。
- 若两数之和等于目标，则完成本回合并获得分数。
- 在每回合倒计时结束前完成规定数量的目标。

### 中文游戏技巧

- 先观察是否存在明显的整十或重复数字组合。
- 选中第一个数字后，立即计算目标与它的差值。
- 不要随机尝试，错误选择会消耗宝贵时间。

### 中文 FAQ

**一次可以选择三个数字吗？**

不能。每个目标必须由恰好两个数字组成。

**数字范围会变化吗？**

会随回合逐渐扩大，但必须保持适合快速心算。

**这个游戏会记录学习数据吗？**

不会。没有账号、成绩档案或长期统计。

**正确率结果会保存吗？**

不会。刷新页面后，正确率、分数、连胜和回合进度都会重置。

**中文相关推荐：** [数学方格冲刺](/zh/games/math-grid-sprint)、[数字果园](/zh/games/sum-orchard)、[三色框选](/zh/games/triad-capture)、[色彩十字](/zh/games/color-cross)

### 本地化验收补充

- 英文页使用 `Target Basket` 与 Part I/Part II 中的英文 SEO；中文页使用 `目标数字篮` 与本节中文 SEO。
- 两个页面共用同一玩法实现、图片和测试规则，但按钮、HUD、结果层、教程与错误提示按当前 Locale 输出。
- 中文页 canonical 指向自身，英文页 canonical 指向自身；两页互相输出 `hreflang`。
- 在中文页面刷新、重新开始或切换语言后，不恢复任何分数、关卡或临时设置。

---

## G29 · 数学方格冲刺（Math Grid Sprint）

### 中文页面与 SEO

| 字段 | 内容 |
|---|---|
| English URL | `/en/games/math-grid-sprint` |
| 中文 URL | `/zh/games/math-grid-sprint` |
| 中文显示名 | `数学方格冲刺` |
| 中文主关键词 | `在线数学方格游戏` |
| 中文 SEO Title | `数学方格冲刺 - 免费在线 5×5 数学小游戏 | {{SITE_NAME}}` |
| 中文 Meta description | `根据行列数字与指定运算填写 5×5 结果网格，在分数倒计时结束前完成加法、减法或乘法挑战。` |
| 中文 H1 | `在线玩数学方格冲刺` |
| 中文分类 | 脑力, 技巧 |
| 中文难度标签 | 三种模式 |
| 中文首页卡片文案 | 根据每行和每列的数字填写 5×5 运算结果，在分数不断下降前完成整张方格。 |
| 中文图片 Alt | 数学方格冲刺 游戏封面，根据每行和每列的数字填写 5×5 运算结果，在分数不断下降前完成整张方格。 |

### 中文 About

数学方格冲刺把基础运算放进 5×5 网格中。顶部和左侧分别给出数字，每个格子的答案由对应行列数字按照本局运算规则计算。玩家可以在加法、减法或乘法模式中完成整张表，分数会随时间下降，但输入与判定必须保持清晰、可访问。

### 中文玩法说明

- 查看当前运算模式以及顶部、左侧的行列数字。
- 选择一个格子，计算对应两个数字的结果并输入。
- 正确答案会锁定，错误答案会提示但不直接暴露结果。
- 在分数倒计时降至最低前完成全部 25 个格子。

### 中文游戏技巧

- 先完成重复数字较多的行或列，建立快速输入节奏。
- 乘法模式可优先填写 0、1、2、5 和 10 的组合。
- 使用键盘方向键在格子间移动，减少鼠标往返时间。

### 中文 FAQ

**包含哪些运算？**

首版支持加法、非负结果的减法和基础乘法，可在开始前选择模式。

**错误答案会扣分吗？**

可以设置轻微时间或分数惩罚，但必须在界面中明确说明。

**会保存我的完成时间吗？**

不会。计时、答案和分数在刷新后全部清空。

**刷新页面后会怎样？**

当前模式、行列数字、答案、分数、计时和正确率都会重置。

**中文相关推荐：** [目标数字篮](/zh/games/target-basket)、[数字果园](/zh/games/sum-orchard)、[回声连线](/zh/games/echo-path)、[色彩十字](/zh/games/color-cross)

### 本地化验收补充

- 英文页使用 `Math Grid Sprint` 与 Part I/Part II 中的英文 SEO；中文页使用 `数学方格冲刺` 与本节中文 SEO。
- 两个页面共用同一玩法实现、图片和测试规则，但按钮、HUD、结果层、教程与错误提示按当前 Locale 输出。
- 中文页 canonical 指向自身，英文页 canonical 指向自身；两页互相输出 `hreflang`。
- 在中文页面刷新、重新开始或切换语言后，不恢复任何分数、关卡或临时设置。

---
