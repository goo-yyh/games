import type { Locale } from "@/i18n/config";
import { siteConfig } from "@/config/site";

export type CategorySlug = "puzzle" | "arcade" | "skill" | "brain";
export type LegalSlug = "about" | "contact" | "privacy" | "cookies" | "terms" | "accessibility";

export const categoryContent: Record<
  CategorySlug,
  Record<Locale, { label: string; title: string; description: string; h1: string; intro: string }>
> = {
  puzzle: {
    en: {
      label: "Puzzle",
      title: `Free Online Puzzle Games – Play in Your Browser | ${siteConfig.name}`,
      description: "Play free browser puzzle games including blocks, numbers, sorting, bubbles, sliding pieces, bolts, and solitaire. No download or sign-up.",
      h1: "Free Online Puzzle Games",
      intro: `Take your time, study the board, and find the cleanest next move. ${siteConfig.name} puzzle games cover block placement, number merging, color sorting, bubble matching, mechanical order puzzles, sliding blocks, and Klondike solitaire. Every title runs directly in the browser and keeps its state only while the page is open.`,
    },
    zh: {
      label: "益智",
      title: `免费在线益智游戏 - 浏览器打开即玩 | ${siteConfig.name}`,
      description: "在线玩方块、数字、排序、泡泡、滑块、螺丝和纸牌等益智游戏，无需下载或注册，电脑与手机均可游玩。",
      h1: "免费在线益智游戏",
      intro: "慢下来观察棋盘，并找到更合适的下一步。这里包含方块摆放、数字合并、颜色排序、泡泡匹配、机械顺序、滑块解谜和经典纸牌接龙。所有游戏都在浏览器中直接运行，状态只保留到当前页面关闭或刷新为止。",
    },
  },
  arcade: {
    en: {
      label: "Arcade",
      title: `Free Online Arcade Games – Instant Browser Play | ${siteConfig.name}`,
      description: "Play quick free arcade games with one-tap, keyboard, pointer, and touch controls. Start instantly on desktop or mobile with no account.",
      h1: "Free Online Arcade Games",
      intro: `Arcade games are built around a clear action and an immediate result. Stack a tower, steer a rolling ball, score a basket, slice fruit, cross a tunnel, or survive an endless course. Each ${siteConfig.name} game starts in the browser, uses original visuals, and resets to a fresh run when the page is refreshed.`,
    },
    zh: {
      label: "街机",
      title: `免费在线街机游戏 - 无需下载立即开始 | ${siteConfig.name}`,
      description: "在线玩单键、键盘、鼠标与触摸控制的轻量街机游戏，无需账号，电脑或手机浏览器打开即可开始。",
      h1: "免费在线街机游戏",
      intro: "街机游戏围绕清晰动作与即时结果展开。叠高塔楼、控制滚球、投入篮筐、切开水果、穿越隧道或挑战无尽路线。每款游戏都使用原创视觉并直接在浏览器中启动，刷新后会开始一局全新的挑战。",
    },
  },
  skill: {
    en: {
      label: "Skill",
      title: `Free Online Skill Games – Test Timing and Reflexes | ${siteConfig.name}`,
      description: "Test timing, aim, balance, and reflexes in free browser skill games designed for keyboard, mouse, and touch controls.",
      h1: "Free Online Skill Games",
      intro: "Skill games reward timing, prediction, and controlled movement. The collection includes precision driving, grappling, platform traps, tunnel navigation, sports shots, slicing, and fast obstacle courses. Controls are simple enough to understand quickly, while difficulty grows through speed, layout, and tighter decisions.",
    },
    zh: {
      label: "技巧",
      title: `免费在线技巧游戏 - 挑战反应与时机 | ${siteConfig.name}`,
      description: "通过免费的浏览器技巧游戏挑战时机、瞄准、平衡和反应速度，支持键盘、鼠标与触摸操作。",
      h1: "免费在线技巧游戏",
      intro: "技巧游戏奖励稳定的时机判断、预判和精细控制。合集包含驾驶、钩索、平台陷阱、隧道穿越、体育射门、切割和高速障碍路线。操作可以快速理解，难度则通过速度、布局和更紧凑的选择逐步提高。",
    },
  },
  brain: {
    en: {
      label: "Brain",
      title: `Free Brain Games Online – Logic & Math Puzzles | ${siteConfig.name}`,
      description: "Play free browser brain games about numbers, patterns, geometry, paths, and quick calculation. No download, account, or saved progress required.",
      h1: "Free Brain Games Online",
      intro: "Challenge number sense, spatial reasoning, pattern recognition, and planning with original browser puzzles that start instantly and reset when you refresh. These games make no medical, intelligence, or academic-performance claims.",
    },
    zh: {
      label: "脑力",
      title: `免费在线脑力游戏 - 逻辑与数学谜题 | ${siteConfig.name}`,
      description: "在线玩数字、图案、几何、路径和快速计算类脑力游戏，无需下载、账号或保存进度，刷新即可开始新挑战。",
      h1: "免费在线脑力游戏",
      intro: "通过原创浏览器谜题挑战数字感、空间推理、图案识别和规划能力。页面打开即可开始，刷新后会生成新的棋盘或重新回到第一关。这里不会声称游戏能够提高智商、治疗疾病或保证考试成绩。",
    },
  },
};

const homeFaq = {
  en: [
    ["Are all games free to play?", `Yes. Every game on ${siteConfig.name} can be played free in a supported web browser.`],
    ["Do I need to create an account?", "No. The launch version has no accounts, profiles, or sign-in flow."],
    ["Is my progress saved?", "No. Scores, levels, deals, settings, and undo history stay only in the current page memory. Refreshing starts over."],
    ["Can I play on a phone or tablet?", "Yes. Every game supports touch controls and responsive layouts, although some skill games are easier in landscape."],
    ["Why does the site show advertisements?", "Advertising may be used to support the cost of creating, testing, and hosting the games. Ads remain clearly separated from gameplay controls."],
    ["Are these games copied from other websites?", "No. The games may use familiar genre rules, but the code, names, art, level data, sound effects, and page content are original."],
  ],
  zh: [
    ["所有游戏都可以免费玩吗？", `可以。${siteConfig.name} 上的每一款游戏都能在受支持的浏览器中免费游玩。`],
    ["需要创建账号吗？", "不需要。首发版本没有账号、个人资料或登录流程。"],
    ["会保存游戏进度吗？", "不会。分数、关卡、牌局、设置和撤销记录只保留在当前页面内存中，刷新后会重新开始。"],
    ["手机或平板可以玩吗？", "可以。所有游戏都支持触摸和响应式布局，但部分技巧游戏使用横屏会更容易操作。"],
    ["为什么网站会显示广告？", "广告可用于支持游戏的制作、测试与托管成本。广告必须与游戏控制区域清楚分离。"],
    ["这些游戏是从其他网站复制的吗？", "不是。部分玩法采用常见品类规则，但代码、名称、美术、关卡数据、音效和页面文案均为原创。"],
  ],
} satisfies Record<Locale, string[][]>;

export function getSiteCopy(locale: Locale | string) {
  const safeLocale: Locale = locale === "zh" ? "zh" : "en";
  const en = safeLocale === "en";
  return {
    nav: {
      allGames: en ? "All games" : "全部游戏",
      puzzle: en ? "Puzzle" : "益智",
      arcade: en ? "Arcade" : "街机",
      skill: en ? "Skill" : "技巧",
      brain: en ? "Brain" : "脑力",
      about: en ? "About" : "关于",
      random: en ? "Random game" : "随机游戏",
      menu: en ? "Open menu" : "打开菜单",
      closeMenu: en ? "Close menu" : "关闭菜单",
    },
    home: {
      title: en
        ? `Free Online Mini Games – Play Instantly | ${siteConfig.name}`
        : `免费在线小游戏 - 无需下载即点即玩 | ${siteConfig.name}`,
      description: en
        ? "Play original browser games with no download or sign-up. Enjoy puzzles, brain games, arcade challenges, sports, and skill games on desktop or mobile."
        : "在线玩原创浏览器小游戏，无需下载或注册。包含益智、脑力、街机、体育和技巧游戏，电脑与手机打开即可开始。",
      eyebrow: en ? "ORIGINAL BROWSER GAMES" : "原创浏览器小游戏",
      h1: en ? "Free Browser Games. No Sign-Up. Just Play." : "免费在线小游戏，无需登录，打开即玩",
      hero: en
        ? "Pick a brain puzzle, arcade challenge, sports round, or physics course and start in seconds. Every game runs in your browser on desktop or mobile."
        : "选择脑力谜题、街机挑战、体育回合或物理闯关，几秒内即可开始。全部游戏都能在电脑或手机浏览器中直接运行。",
      primaryCta: en ? "Browse all games" : "浏览全部游戏",
      secondaryCta: en ? "Play Block Bloom" : "开始玩方块绽放",
      trust: en
        ? ["Free to play", "No account", "Desktop + mobile", "Fresh start on refresh"]
        : ["免费游玩", "无需账号", "电脑与手机", "刷新重新开始"],
      intro: en
        ? [
            `${siteConfig.name} is a focused collection of original browser games made for quick breaks, relaxed problem solving, and score chasing. There are no downloads, accounts, profiles, or cloud saves. Choose a game, press Play, and the interactive module loads only when you are ready.`,
            "The collection includes number puzzles, geometry challenges, path games, block and color logic, one-button arcade runs, sports rounds, physics levels, and classic solitaire. Game progress stays only in the open page. Refreshing starts a new board, run, deal, or level one.",
          ]
        : [
            `${siteConfig.name} 是一个专注于原创浏览器小游戏的合集，适合短暂休息、轻松解谜和反复挑战分数。网站不要求下载、注册、创建个人资料或使用云存档。选择一款游戏并点击“开始游戏”，对应的互动模块才会按需加载。`,
            "合集包含数字谜题、几何挑战、路径连接、方块与颜色逻辑、单键街机、体育回合、物理关卡和经典纸牌接龙。游戏进度只保留在当前打开的页面中；刷新后会开始新的棋盘、新的一局、新的牌局或第一关。",
          ],
      featured: en ? "Featured games" : "精选游戏",
      allGames: en ? "All 29 games" : "全部 29 款游戏",
      searchPlaceholder: en ? "Search games" : "搜索游戏",
      noResults: en ? "No games match that search." : "没有找到符合条件的游戏。",
      gardenTitle: en ? "Garden Logic" : "花园逻辑",
      gardenCopy: en
        ? "Nine original number, color, shape, and path puzzles built for quick thinking. Every board runs locally in your browser and starts fresh when you refresh."
        : "九款原创数字、颜色、形状与路径谜题，规则清晰，打开即玩。所有棋盘都在浏览器本地运行，刷新后重新开始。",
      gardenCta: en ? "Explore Garden Logic" : "探索花园逻辑",
      whyTitle: en ? "Quick games, carefully built" : "精心制作的轻量小游戏",
      why: en
        ? [
            ["Instant play", "Open a game and start without registration, installation, or a long setup flow."],
            ["Made for every screen", "Keyboard, pointer, and touch controls are designed together instead of treating mobile as an afterthought."],
            ["Original challenges", "Every launch game uses original code, visuals, level data, and page content."],
          ]
        : [
            ["打开即玩", "无需注册、安装或经历冗长设置，打开游戏即可开始。"],
            ["适配每块屏幕", "键盘、鼠标与触摸操作统一设计，手机端不是事后补充。"],
            ["原创挑战", "首发游戏使用原创代码、视觉、关卡数据与页面内容。"],
          ],
      faqTitle: en ? "Questions, answered" : "常见问题",
      faq: homeFaq[safeLocale].map(([question, answer]) => ({ question, answer })),
    },
    cards: {
      play: en ? "Play now" : "立即游玩",
      free: en ? "Free" : "免费",
    },
    breadcrumb: {
      home: en ? "Home" : "首页",
      games: en ? "Games" : "游戏",
      collection: en ? "Collections" : "合集",
    },
    game: {
      play: en ? "Play game" : "开始游戏",
      loading: en ? "Minting your game…" : "正在准备游戏……",
      progress: en
        ? "Game progress is not saved. Refreshing this page starts over."
        : "游戏进度不会保存，刷新此页面后会重新开始。",
      about: en ? "About" : "关于",
      howTo: en ? "How to play" : "玩法说明",
      tips: en ? "Tips" : "游戏技巧",
      faq: en ? "Frequently asked questions" : "常见问题",
      related: en ? "More games like this" : "更多相似游戏",
      noSignup: en ? "No sign-up" : "无需登录",
      controls: en ? "Controls" : "操作",
    },
    footer: {
      games: en ? "Games" : "游戏",
      company: en ? "Company" : "站点",
      legal: en ? "Legal" : "法律",
      tagline: en ? "Fresh games. Instant play." : "新鲜游戏，打开即玩。",
      contact: en ? "Contact" : "联系",
      accessibility: en ? "Accessibility" : "无障碍",
      privacy: en ? "Privacy" : "隐私",
      cookies: en ? "Cookie policy" : "Cookie 政策",
      terms: en ? "Terms" : "条款",
      garden: en ? "Garden Logic" : "花园逻辑",
      copyright: en
        ? `© ${new Date().getFullYear()} ${siteConfig.name}. Original browser games. All rights reserved.`
        : `© ${new Date().getFullYear()} ${siteConfig.name}。原创浏览器小游戏，保留所有权利。`,
    },
  };
}

export const gardenContent: Record<Locale, {
  title: string;
  description: string;
  h1: string;
  intro: string;
  body: string[];
  practiceTitle: string;
  practice: string[];
  faq: { question: string; answer: string }[];
}> = {
  en: {
    title: `Free Brain Games & Logic Puzzles Online | ${siteConfig.name}`,
    description: "Play nine original number, color, geometry, path, and math puzzles directly in your browser. No download, account, or saved progress required.",
    h1: "Garden Logic: Free Brain Games Online",
    intro: "Garden Logic is a focused set of original browser puzzles about numbers, colors, geometry, paths, and quick calculation. Each game opens instantly, keeps its state only in the current page, and starts fresh after a refresh.",
    body: [
      "These games are designed around compact rules rather than long tutorials. Some ask you to find a total inside a grid, while others turn empty space, straight lines, right angles, or matching endpoints into the main puzzle. Short timers make several games feel energetic, but every result comes from clear rules that can be learned in one round.",
      "No account or cloud save is used. A score, board, selected mode, and temporary accessibility setting stay only in the open page. Refreshing creates a new run, which makes the collection suitable for quick breaks rather than long progression systems.",
    ],
    practiceTitle: "What you will practice",
    practice: ["Number sense", "Pattern recognition", "Spatial reasoning", "Planning"],
    faq: [
      { question: "Are these games copied from Gamesaien?", answer: "No. The collection was informed by familiar puzzle mechanics, but every public name, rule implementation, score system, visual, board generator, interface, image, and page text is original." },
      { question: "Do the brain games save progress?", answer: "No. Each game keeps temporary state only while its page remains open." },
      { question: "Can I play with touch controls?", answer: "Yes. Every game supports phones and tablets, and each one also has a keyboard path." },
      { question: "Are colors the only way to understand the pieces?", answer: "No. Color-based games pair colors with symbols or shapes and include high-contrast presentation." },
      { question: "Do I need to download anything?", answer: "No. The games run directly in a supported browser." },
    ],
  },
  zh: {
    title: `花园逻辑 - 免费在线脑力与逻辑游戏 | ${siteConfig.name}`,
    description: "在线玩九款原创数字、颜色、几何、路径与数学谜题，无需下载、账号或保存进度，电脑和手机都能直接开始。",
    h1: "花园逻辑：免费在线脑力游戏",
    intro: "花园逻辑是一组围绕数字、颜色、几何、路径和快速计算设计的原创浏览器谜题。每款游戏都能立即打开，状态只保留在当前页面中，刷新后会开始一盘新的挑战。",
    body: [
      "这些游戏强调紧凑规则，而不是冗长教程。有的要求在网格中找出目标总和，有的把空白位置、直线、直角或相同端点变成谜题核心。部分游戏带有短倒计时，但所有结果都来自一轮内可以理解的明确规则。",
      "网站不使用账号或云存档。分数、棋盘、当前模式与临时无障碍设置只存在于打开的页面中。刷新后会开始新的一局，因此这个合集更适合短暂休息，而不是长期成长系统。",
    ],
    practiceTitle: "可以练习什么",
    practice: ["数字感", "图案识别", "空间推理", "规划能力"],
    faq: [
      { question: "这些游戏是从 Gamesaien 复制的吗？", answer: "不是。合集参考了常见益智机制，但公开名称、规则实现、计分、视觉、棋盘生成、界面、图片和页面文字均为原创。" },
      { question: "脑力游戏会保存进度吗？", answer: "不会。每款游戏只在页面打开期间保留临时状态。" },
      { question: "可以使用触摸操作吗？", answer: "可以。全部游戏支持手机和平板，并同时提供键盘操作路径。" },
      { question: "只能通过颜色识别棋子吗？", answer: "不能。依赖颜色的游戏同时使用符号、形状或纹理，并提供高对比度呈现。" },
      { question: "需要下载内容吗？", answer: "不需要。游戏直接运行在受支持的浏览器中。" },
    ],
  },
};

type PolicySection = { heading: string; paragraphs: string[]; bullets?: string[] };
type LegalPage = { title: string; description: string; h1: string; intro?: string; sections: PolicySection[] };

export function getLegalPage(slug: LegalSlug, locale: Locale): LegalPage {
  const en = locale === "en";
  const email = siteConfig.contactEmail;
  const common = {
    about: {
      title: en ? `About ${siteConfig.name} – Original Browser Games` : `关于 ${siteConfig.name} - 原创浏览器小游戏`,
      description: en ? `Learn how ${siteConfig.name} builds original, lightweight browser games that work without downloads, accounts, or saved progress.` : `了解 ${siteConfig.name} 如何制作无需下载、账号或保存进度的原创轻量浏览器小游戏。`,
      h1: en ? `About ${siteConfig.name}` : `关于 ${siteConfig.name}`,
      sections: en ? [
        { heading: "Games made for the browser", paragraphs: [`${siteConfig.name} is a collection of original mini games designed to run directly in modern web browsers. The launch library includes puzzles, arcade challenges, sports rounds, platform courses, physics games, brain teasers, and classic solitaire.`] },
        { heading: "A fresh start by design", paragraphs: ["The site does not require an account, profile, download, or cloud save. Game state exists only while the current page is open. Refreshing a game starts a new run, deal, or first level."] },
        { heading: "Original work", paragraphs: [`Game mechanics may belong to familiar genres, but the launch code, names, visual assets, sound effects, level data, and written guides are created for this project. For questions, accessibility feedback, or copyright concerns, contact ${email}.`] },
      ] : [
        { heading: "为浏览器制作的游戏", paragraphs: [`${siteConfig.name} 是一个面向现代浏览器设计的原创小游戏合集。首发内容包括益智、街机、体育、平台跳跃、物理闯关、脑力谜题和经典纸牌接龙。`] },
        { heading: "刷新即重新开始", paragraphs: ["网站不要求创建账号、个人资料、下载应用或使用云存档。游戏状态只在当前页面打开期间存在，刷新游戏页后会开始新的一局、新的牌局或第一关。"] },
        { heading: "原创内容", paragraphs: [`游戏机制可能属于常见品类，但首发代码、名称、视觉资源、音效、关卡数据和文字指南均为本项目原创。如需咨询、反馈无障碍问题或提交版权通知，请联系 ${email}。`] },
      ],
    },
    contact: {
      title: en ? `Contact ${siteConfig.name}` : `联系 ${siteConfig.name}`,
      description: en ? `Contact ${siteConfig.name} about general questions, accessibility, copyright notices, advertising, or business enquiries.` : `就一般问题、无障碍反馈、版权通知、广告或商务合作联系 ${siteConfig.name}。`,
      h1: en ? "Contact us" : "联系我们",
      intro: en ? `Email ${email}. Choose a subject below so your message reaches the right place.` : `请发送邮件至 ${email}，并从下列主题中选择最合适的一项。`,
      sections: [{
        heading: en ? "Email topics" : "邮件主题",
        paragraphs: [en ? "Please do not send passwords, payment information, or other sensitive personal information by email." : "请勿通过邮件发送密码、支付信息或其他敏感个人信息。"],
        bullets: en ? ["General questions", "Accessibility feedback", "Copyright and intellectual-property notices", "Advertising and business enquiries"] : ["一般问题", "无障碍反馈", "版权与知识产权通知", "广告与商务合作"],
      }],
    },
  } satisfies Partial<Record<LegalSlug, LegalPage>>;

  if (slug === "about" || slug === "contact") return common[slug];

  if (slug === "privacy") {
    return {
      title: en ? `Privacy Policy | ${siteConfig.name}` : `隐私政策 | ${siteConfig.name}`,
      description: en ? `How ${siteConfig.name}, its host, consent tools, and advertising partners may process technical and privacy data.` : `了解 ${siteConfig.name}、托管服务、同意管理工具与广告合作伙伴可能如何处理技术和隐私数据。`,
      h1: en ? "Privacy Policy" : "隐私政策",
      intro: en ? `Effective ${siteConfig.effectiveDate}. This policy explains how ${siteConfig.legalName} operates ${siteConfig.name}.` : `生效日期：${siteConfig.effectiveDateZh}。本政策说明 ${siteConfig.legalName} 如何运营 ${siteConfig.name}。`,
      sections: en ? privacyEn(email) : privacyZh(email),
    };
  }

  if (slug === "cookies") {
    return {
      title: en ? `Cookie Policy | ${siteConfig.name}` : `Cookie 政策 | ${siteConfig.name}`,
      description: en ? `Learn how consent tools and advertising partners may use cookies on ${siteConfig.name}. Game progress never uses browser storage.` : `了解同意管理工具和广告合作伙伴可能如何在 ${siteConfig.name} 使用 Cookie；游戏进度不会写入浏览器存储。`,
      h1: en ? "Cookie Policy" : "Cookie 政策",
      intro: en ? `Effective ${siteConfig.effectiveDate}.` : `生效日期：${siteConfig.effectiveDateZh}。`,
      sections: en ? cookieEn(email) : cookieZh(email),
    };
  }

  if (slug === "terms") {
    return {
      title: en ? `Terms of Use | ${siteConfig.name}` : `使用条款 | ${siteConfig.name}`,
      description: en ? `Terms governing personal use of ${siteConfig.name}, its original games, content, and third-party services.` : `适用于个人使用 ${siteConfig.name}、原创游戏、站点内容与第三方服务的条款。`,
      h1: en ? "Terms of Use" : "使用条款",
      intro: en ? `Effective ${siteConfig.effectiveDate}. By using the site, you accept these terms.` : `生效日期：${siteConfig.effectiveDateZh}。使用本网站即表示你接受这些条款。`,
      sections: en ? termsEn(email) : termsZh(email),
    };
  }

  return {
    title: en ? `Accessibility | ${siteConfig.name}` : `无障碍说明 | ${siteConfig.name}`,
    description: en ? `${siteConfig.name} accessibility goals, supported inputs, known limitations, and issue-reporting contact.` : `${siteConfig.name} 的无障碍目标、支持的输入方式、已知限制与问题反馈渠道。`,
    h1: en ? "Accessibility" : "无障碍说明",
    intro: en ? `We aim to make ${siteConfig.name} usable with keyboard, touch, pointer, and assistive technology wherever the game format allows. Site navigation, buttons, instructions, and written content should meet WCAG 2.2 AA expectations. Some fast visual games may remain challenging for certain users, so each page explains its controls and provides alternative input where practical.` : `我们希望 ${siteConfig.name} 在游戏形式允许的范围内，能够通过键盘、触摸、鼠标和辅助技术使用。站点导航、按钮、说明与文字内容应达到 WCAG 2.2 AA 的预期。部分高速视觉游戏对某些用户仍可能具有挑战，因此每个页面都要说明操作方式，并在可行时提供替代输入。`,
    sections: en ? accessibilityEn(email) : accessibilityZh(email),
  };
}

function privacyEn(email: string): PolicySection[] { return [
  { heading: "Who operates the site", paragraphs: [`${siteConfig.legalName} operates this site. Contact: ${email}.`] },
  { heading: "No user accounts", paragraphs: ["We do not offer user accounts, profiles, or a sign-in system."] },
  { heading: "Game state", paragraphs: ["The site does not save game progress, scores, levels, deals, settings, or undo history. Game state stays in page memory and is discarded on refresh or close."] },
  { heading: "Hosting and security data", paragraphs: ["Vercel and related delivery or security services may process routine request logs, IP addresses, user-agent strings, timestamps, error information, and security signals needed to deliver and protect the site."] },
  { heading: "Advertising and consent", paragraphs: ["If advertising is enabled, Google AdSense, a certified consent management platform, and approved partners may use cookies, device identifiers, and similar technologies depending on region, consent choice, and ad settings."] },
  { heading: "Google services", paragraphs: ["Google’s processing is governed by its own Privacy Policy and Terms. Links to those documents are provided in the consent interface and on Google’s public policy pages."] },
  { heading: "EEA, UK, and Switzerland", paragraphs: ["Where required, a certified consent interface offers consent, do-not-consent, and manage-options controls before non-essential advertising storage is used. You can reopen that interface to withdraw or change a choice."] },
  { heading: "United States privacy choices", paragraphs: ["Where applicable, regional privacy controls may offer opt-out or limit-use choices. Availability depends on location and the services enabled on the site."] },
  { heading: "Retention", paragraphs: ["Retention periods for hosting, security, consent, and advertising data are determined by the relevant provider policies and the site configuration. We do not create a separate game-history database."] },
  { heading: "Children", paragraphs: ["The site is intended for a general audience and is not directed specifically to children under 13. Do not send personal information through email on behalf of a child."] },
  { heading: "International processing", paragraphs: ["Providers may process technical data in countries other than your own, subject to their contractual and legal transfer safeguards."] },
  { heading: "Your choices", paragraphs: ["You may manage consent through the site’s certified consent tool when available, use browser controls to remove cookies, and contact us about a privacy question."] },
  { heading: "Policy changes", paragraphs: ["We may update this policy when the site, providers, or legal requirements change. The effective date above will be updated when revisions are published."] },
  { heading: "Contact", paragraphs: [`Privacy questions can be sent to ${email}. Do not include passwords, payment information, or sensitive identifiers.`] },
]; }

function privacyZh(email: string): PolicySection[] { return [
  { heading: "网站运营方", paragraphs: [`本网站由 ${siteConfig.legalName} 运营。联系邮箱：${email}。`] },
  { heading: "不创建用户账号", paragraphs: ["网站不提供用户账号、个人资料或登录系统。"] },
  { heading: "游戏状态", paragraphs: ["本站不保存游戏进度、分数、关卡、牌局、设置或撤销记录。状态仅存在于当前页面内存中，刷新或关闭页面后即被丢弃。"] },
  { heading: "托管与安全数据", paragraphs: ["Vercel 及相关内容分发或安全服务可能为交付和保护网站而处理常规请求日志、IP 地址、User-Agent、时间戳、错误信息与安全信号。"] },
  { heading: "广告与同意管理", paragraphs: ["启用广告后，Google AdSense、经认证的同意管理平台及获批合作伙伴可能根据地区、同意选择和广告设置使用 Cookie、设备标识符及类似技术。"] },
  { heading: "Google 服务", paragraphs: ["Google 的数据处理受其自身隐私政策与服务条款约束。相关链接会显示在同意界面和 Google 公开政策页面中。"] },
  { heading: "欧洲经济区、英国与瑞士", paragraphs: ["在法律要求的地区，经认证的同意界面会在使用非必要广告存储前提供同意、不同意和管理选项。你可以重新打开该界面以撤回或修改选择。"] },
  { heading: "美国州隐私选择", paragraphs: ["在适用地区，区域隐私控件可能提供退出或限制使用选项，具体可用性取决于所在位置与网站启用的服务。"] },
  { heading: "数据保留", paragraphs: ["托管、安全、同意与广告数据的保留期限由相关服务商政策及站点配置决定。本站不会另行创建游戏历史数据库。"] },
  { heading: "儿童", paragraphs: ["网站面向一般受众，并非专门面向 13 岁以下儿童。请勿通过邮件代表儿童发送个人信息。"] },
  { heading: "国际处理", paragraphs: ["服务商可能在你所在国家或地区以外处理技术数据，并遵守其合同与法律要求的跨境传输保障。"] },
  { heading: "你的选择", paragraphs: ["你可以通过网站提供的经认证同意工具管理选择，使用浏览器控件删除 Cookie，或联系我们提出隐私问题。"] },
  { heading: "政策更新", paragraphs: ["当网站、服务商或法律要求发生变化时，我们可能更新本政策，并同步更新上方生效日期。"] },
  { heading: "联系方式", paragraphs: [`隐私问题可发送至 ${email}。请勿包含密码、支付信息或敏感身份标识。`] },
]; }

function cookieEn(email: string): PolicySection[] { return [
  { heading: "Game state never uses storage", paragraphs: ["Games do not use cookies, localStorage, sessionStorage, IndexedDB, or similar browser storage for progress, scores, levels, settings, or statistics."] },
  { heading: "Necessary consent storage", paragraphs: ["A certified consent management platform may use strictly necessary storage to remember a privacy choice and avoid asking on every page."] },
  { heading: "Advertising technologies", paragraphs: ["When advertising is enabled and permitted, Google and approved partners may use advertising cookies, device identifiers, or similar technologies for ad delivery, measurement, fraud prevention, and choices allowed by your consent status."] },
  { heading: "Manage choices", paragraphs: ["Use the consent interface to consent, decline, or manage available purposes and partners. Browser settings can also remove cookies, although that may make the privacy prompt appear again."] },
  { heading: "No disguised consent", paragraphs: ["The site does not use a custom accept-only banner. Applicable consent is handled through a certified interface with meaningful choices."] },
  { heading: "Contact and updates", paragraphs: [`This policy is effective ${siteConfig.effectiveDate}. Questions can be sent to ${email}.`] },
]; }

function cookieZh(email: string): PolicySection[] { return [
  { heading: "游戏状态不使用存储", paragraphs: ["游戏不会使用 Cookie、localStorage、sessionStorage、IndexedDB 或类似浏览器存储保存进度、分数、关卡、设置或统计。"] },
  { heading: "必要的同意记录", paragraphs: ["经认证的同意管理平台可能使用严格必要的存储来记录隐私选择，避免在每个页面重复询问。"] },
  { heading: "广告技术", paragraphs: ["启用广告且得到允许时，Google 及获批合作伙伴可能使用广告 Cookie、设备标识符或类似技术，用于广告交付、衡量、防欺诈及同意状态允许的用途。"] },
  { heading: "管理选择", paragraphs: ["你可以通过同意界面选择同意、拒绝或管理可用目的和合作伙伴，也可使用浏览器设置删除 Cookie；删除后隐私提示可能再次出现。"] },
  { heading: "不使用伪同意弹窗", paragraphs: ["网站不会制作只有“接受”按钮的自定义弹窗。适用的同意流程通过提供有效选择的认证界面完成。"] },
  { heading: "联系与更新", paragraphs: [`本政策自 ${siteConfig.effectiveDateZh} 起生效。如有问题，请联系 ${email}。`] },
]; }

function termsEn(email: string): PolicySection[] { return [
  { heading: "Acceptance", paragraphs: ["By accessing or using the site, you agree to these Terms of Use. If you do not agree, do not use the site."] },
  { heading: "Free, as-is service", paragraphs: ["The games are offered free of charge and on an as-is and as-available basis. Features, game balance, and availability may change."] },
  { heading: "Permitted use", paragraphs: ["You may play the games normally for personal, non-commercial entertainment and link to public pages."] },
  { heading: "Prohibited use", paragraphs: [], bullets: ["Attack, disrupt, overload, or bypass site security", "Reverse-engineer the service for abuse or redistribute extracted assets", "Generate automated ad interactions, invalid traffic, or fraudulent impressions", "Use cheats or automation to interfere with other users or service integrity", "Scrape and republish game art, text, level data, or substantial site content"] },
  { heading: "Intellectual property", paragraphs: [`The ${siteConfig.name} names, original game code, visual assets, level data, sound design, interface, and written content are protected by applicable intellectual-property laws. Familiar genre mechanics are not claimed as exclusive.`] },
  { heading: "Third-party services", paragraphs: ["Hosting, consent, advertising, analytics, or external links may be provided by third parties under their own terms and privacy policies. We are not responsible for third-party content or availability."] },
  { heading: "No warranties", paragraphs: ["To the maximum extent permitted by law, we make no warranty that the site will be uninterrupted, error-free, compatible with every device, or suitable for a particular purpose."] },
  { heading: "Limitation of liability", paragraphs: ["To the maximum extent permitted by law, the operator is not liable for indirect, incidental, special, consequential, or lost-profit damages arising from use of the free site. Rights that cannot legally be excluded remain unaffected."] },
  { heading: "Changes and suspension", paragraphs: ["We may update games or terms, remove content, or suspend part of the service for maintenance, safety, legal, or operational reasons."] },
  { heading: "General audience and governing law", paragraphs: [`The site is for a general audience. These terms are governed by ${siteConfig.governingLaw}, without overriding mandatory consumer protections that apply to you.`] },
  { heading: "Contact", paragraphs: [`Questions about these terms can be sent to ${email}.`] },
]; }

function termsZh(email: string): PolicySection[] { return [
  { heading: "接受条款", paragraphs: ["访问或使用本网站，即表示你同意本使用条款。如不同意，请停止使用。"] },
  { heading: "免费并按现状提供", paragraphs: ["游戏免费并按“现状”和“可用状态”提供，功能、平衡性与可用性可能发生变化。"] },
  { heading: "允许的使用", paragraphs: ["你可以出于个人、非商业娱乐目的正常游玩，并链接到公开页面。"] },
  { heading: "禁止的使用", paragraphs: [], bullets: ["攻击、干扰、过载网站或绕过安全措施", "为滥用目的逆向服务或重新分发提取的素材", "制造自动广告交互、无效流量或欺诈展示", "使用作弊或自动化破坏服务完整性", "抓取并重新发布游戏美术、文字、关卡数据或大量站点内容"] },
  { heading: "知识产权", paragraphs: [`${siteConfig.name} 名称、原创游戏代码、视觉资源、关卡数据、音效设计、界面和文字内容受适用知识产权法律保护。本站不声称对常见游戏品类机制拥有排他权。`] },
  { heading: "第三方服务", paragraphs: ["托管、同意管理、广告、分析或外部链接可能由第三方按照其自身条款和隐私政策提供。我们不对第三方内容或可用性负责。"] },
  { heading: "无保证", paragraphs: ["在法律允许的最大范围内，我们不保证网站始终不中断、完全无错误、兼容所有设备或适合特定用途。"] },
  { heading: "责任限制", paragraphs: ["在法律允许的最大范围内，运营方不对因使用免费站点产生的间接、附带、特殊、后果性或利润损失承担责任。法律不能排除的权利不受影响。"] },
  { heading: "更新与暂停", paragraphs: ["我们可能更新游戏或条款、移除内容，或因维护、安全、法律与运营原因暂停部分服务。"] },
  { heading: "一般受众与适用法律", paragraphs: [`网站面向一般受众。本条款受${siteConfig.governingLaw}管辖，但不会排除对你强制适用的消费者保护。`] },
  { heading: "联系方式", paragraphs: [`条款相关问题可发送至 ${email}。`] },
]; }

function accessibilityEn(email: string): PolicySection[] { return [
  { heading: "Keyboard and alternative input", paragraphs: ["Navigation and shared controls work with a keyboard. Pointer-focused games provide keyboard alternatives where practical, and each game page explains available controls."] },
  { heading: "Focus", paragraphs: ["Interactive elements use visible focus indicators and a logical tab order. Dialog focus moves to the result and returns to the game when closed."] },
  { heading: "Contrast and color", paragraphs: ["Text and controls target WCAG 2.2 AA contrast. Games do not rely on color alone; shapes, symbols, patterns, labels, or position provide additional meaning."] },
  { heading: "Motion and flashing", paragraphs: ["The interface honors reduced-motion preferences and avoids full-screen flashing over three times per second. Essential game movement may remain, but decorative movement is reduced."] },
  { heading: "Touch and zoom", paragraphs: ["Touch targets are designed around a 44-by-44 CSS-pixel minimum where practical. Layouts support narrow screens and browser zoom without horizontal page overflow."] },
  { heading: "Known limitations", paragraphs: ["Fast visual games, timing challenges, physics movement, and dense boards can remain difficult for some players even with alternate controls. Audio is optional and never the only way to understand an outcome."] },
  { heading: "Report a problem", paragraphs: [`Send the page URL, device, browser, and a description of the barrier to ${email}. Do not include sensitive personal information.`] },
]; }

function accessibilityZh(email: string): PolicySection[] { return [
  { heading: "键盘与替代输入", paragraphs: ["站点导航和共用控件支持键盘操作。以指针为主的游戏会在可行时提供键盘替代，并在每个游戏页面说明可用操作。"] },
  { heading: "焦点", paragraphs: ["互动元素具有清晰焦点样式与合理 Tab 顺序。结果弹层打开时焦点进入结果区域，关闭后返回游戏。"] },
  { heading: "对比度与颜色", paragraphs: ["文字和控件以 WCAG 2.2 AA 对比度为目标。游戏不会只依赖颜色传达信息，还会结合形状、符号、纹理、标签或位置。"] },
  { heading: "动画与闪烁", paragraphs: ["界面遵守减少动态效果偏好，并避免每秒超过三次的全屏闪烁。核心玩法需要的运动可能保留，但装饰性动画会减少。"] },
  { heading: "触摸与缩放", paragraphs: ["可行时触摸目标至少约为 44×44 CSS 像素。布局支持窄屏和浏览器缩放，不产生页面横向溢出。"] },
  { heading: "已知限制", paragraphs: ["即使提供替代操作，高速视觉、时机挑战、物理运动和密集棋盘仍可能给部分玩家带来困难。音效始终可选，也不会成为理解结果的唯一方式。"] },
  { heading: "报告问题", paragraphs: [`请把页面地址、设备、浏览器和遇到的障碍发送至 ${email}，不要包含敏感个人信息。`] },
]; }
