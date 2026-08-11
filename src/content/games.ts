import gameData from "./games.generated.json";
import type { Locale } from "@/i18n/config";

export type GameFaq = { question: string; answer: string };
export type GameLocaleContent = {
  name: string;
  keyword: string;
  seoTitle: string;
  description: string;
  h1: string;
  categories: string[];
  difficulty: string;
  cardCopy: string;
  imageAlt: string;
  about: string;
  howTo: string[];
  tips: string[];
  faq: GameFaq[];
  relatedSlugs: string[];
};

export type Game = {
  id: string;
  number: number;
  slug: string;
  mechanic: string;
  controls: string;
  rules: string[];
  scoring: string;
  implementation: string[];
  acceptance: string[];
  coverPrompt: string;
  locales: Record<Locale, GameLocaleContent>;
};

export type GameCardData = {
  id: string;
  slug: string;
  locales: Record<Locale, Pick<GameLocaleContent, "name" | "categories" | "cardCopy" | "imageAlt">>;
};

export const games = gameData as Game[];
export const gardenLogicSlugs = games.slice(20).map((game) => game.slug);

export function getGame(slug: string) {
  return games.find((game) => game.slug === slug);
}

export function getGameCopy(game: Game, locale: Locale) {
  return game.locales[locale];
}

export function gamesInCategory(category: string) {
  const normalized = category.toLowerCase();
  return games.filter((game) =>
    game.locales.en.categories.some((value) => value.toLowerCase() === normalized),
  );
}

export function toGameCardData(game: Game): GameCardData {
  return {
    id: game.id,
    slug: game.slug,
    locales: {
      en: {
        name: game.locales.en.name,
        categories: game.locales.en.categories,
        cardCopy: game.locales.en.cardCopy,
        imageAlt: game.locales.en.imageAlt,
      },
      zh: {
        name: game.locales.zh.name,
        categories: game.locales.zh.categories,
        cardCopy: game.locales.zh.cardCopy,
        imageAlt: game.locales.zh.imageAlt,
      },
    },
  };
}

export const gamePresentation: Record<
  string,
  { icon: string; control: { en: string; zh: string }; accent: string; accent2: string }
> = {
  "block-bloom": { icon: "▦", control: { en: "Tap + place", zh: "点击摆放" }, accent: "#7c5cff", accent2: "#27d3a2" },
  "number-merge-2048": { icon: "2048", control: { en: "Keys + swipe", zh: "按键与滑动" }, accent: "#f6b84a", accent2: "#ff7b6b" },
  "neon-snake": { icon: "⌁", control: { en: "Keys + swipe", zh: "按键与滑动" }, accent: "#27d3a2", accent2: "#8ed8ff" },
  "sky-stack": { icon: "▤", control: { en: "One tap", zh: "单键操作" }, accent: "#8ed8ff", accent2: "#f7c948" },
  "zigzag-drift": { icon: "↝", control: { en: "One tap", zh: "单键操作" }, accent: "#ff8a66", accent2: "#7c5cff" },
  "tap-hoops": { icon: "◉", control: { en: "One tap", zh: "单键操作" }, accent: "#ff9d3d", accent2: "#8ed8ff" },
  "color-pour": { icon: "◫", control: { en: "Tap tubes", zh: "点击试管" }, accent: "#ff627d", accent2: "#27d3a2" },
  "penalty-hero": { icon: "⚽", control: { en: "Aim + tap", zh: "瞄准点击" }, accent: "#45c779", accent2: "#f7c948" },
  "slope-dash": { icon: "●", control: { en: "Keys + tilt", zh: "按键转向" }, accent: "#fb4dff", accent2: "#58d8ff" },
  "helix-drop": { icon: "◌", control: { en: "Drag tower", zh: "拖动旋塔" }, accent: "#7c5cff", accent2: "#ff627d" },
  "tunnel-flux": { icon: "◎", control: { en: "Keys + drag", zh: "按键与拖动" }, accent: "#27d3d0", accent2: "#7c5cff" },
  "bubble-pop-shooter": { icon: "◉", control: { en: "Aim + shoot", zh: "瞄准发射" }, accent: "#ff627d", accent2: "#8ed8ff" },
  "bolt-away": { icon: "✣", control: { en: "Tap bolts", zh: "点击螺栓" }, accent: "#f7c948", accent2: "#8ed8ff" },
  "unblock-path": { icon: "▰", control: { en: "Drag blocks", zh: "拖动方块" }, accent: "#ff8a66", accent2: "#27d3a2" },
  "wave-rider": { icon: "⌁", control: { en: "Hold + release", zh: "按住与松开" }, accent: "#27d3a2", accent2: "#7c5cff" },
  "fruit-slice-rush": { icon: "✦", control: { en: "Swipe", zh: "滑动切割" }, accent: "#ff627d", accent2: "#f7c948" },
  "hook-swing": { icon: "⌇", control: { en: "Hold + release", zh: "按住与松开" }, accent: "#8ed8ff", accent2: "#ff8a66" },
  "trap-runner": { icon: "▲", control: { en: "Keys + jump", zh: "按键跳跃" }, accent: "#ff627d", accent2: "#f7c948" },
  "rugged-wheels": { icon: "◉◉", control: { en: "Keys + balance", zh: "按键平衡" }, accent: "#f7c948", accent2: "#27d3a2" },
  "classic-solitaire": { icon: "♠", control: { en: "Click + drag", zh: "点击与拖动" }, accent: "#ff627d", accent2: "#f8fafc" },
  "sum-orchard": { icon: "12", control: { en: "Drag a box", zh: "拖动框选" }, accent: "#a8df65", accent2: "#ffad66" },
  "color-cross": { icon: "✚", control: { en: "Tap a cell", zh: "点击空位" }, accent: "#ff627d", accent2: "#7c5cff" },
  "orbit-lines": { icon: "◌", control: { en: "Move a token", zh: "移动棋子" }, accent: "#8ed8ff", accent2: "#f7c948" },
  "corner-stars": { icon: "⌞", control: { en: "Choose 3 points", zh: "选择三点" }, accent: "#f7c948", accent2: "#7c5cff" },
  "sidefall-blocks": { icon: "▥", control: { en: "Move + drop", zh: "横移下落" }, accent: "#27d3a2", accent2: "#ff627d" },
  "triad-capture": { icon: "△○□", control: { en: "Drag a box", zh: "拖动框选" }, accent: "#ff8a66", accent2: "#8ed8ff" },
  "echo-path": { icon: "↔", control: { en: "Draw a path", zh: "绘制路径" }, accent: "#7c5cff", accent2: "#27d3a2" },
  "target-basket": { icon: "Σ", control: { en: "Pick 2 numbers", zh: "选择两数" }, accent: "#ffad66", accent2: "#27d3a2" },
  "math-grid-sprint": { icon: "×", control: { en: "Type answers", zh: "输入答案" }, accent: "#8ed8ff", accent2: "#f7c948" },
};
