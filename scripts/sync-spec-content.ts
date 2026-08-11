import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const specPath = resolve(root, "specs/arcademint-29-games-bilingual-master-spec.md");
const outputPath = resolve(root, "src/content/games.generated.json");
const spec = readFileSync(specPath, "utf8");

type Faq = { question: string; answer: string };
type GameLocale = {
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
  faq: Faq[];
  relatedSlugs: string[];
};

type GameRecord = {
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
  locales: { en: GameLocale; zh: GameLocale };
};

function stripMarkdown(value: string) {
  return value
    .trim()
    .replace(/^`|`$/g, "")
    .replaceAll("{{SITE_NAME}}", "ArcadeMint")
    .replace(/\s+/g, " ")
    .trim();
}

function sectionBetween(source: string, start: RegExp, end: RegExp) {
  const startMatch = start.exec(source);
  if (!startMatch) return "";
  const rest = source.slice(startMatch.index + startMatch[0].length);
  const endMatch = end.exec(rest);
  return endMatch ? rest.slice(0, endMatch.index).trim() : rest.trim();
}

function sectionAfter(source: string, start: RegExp) {
  const startMatch = start.exec(source);
  return startMatch
    ? source.slice(startMatch.index + startMatch[0].length).trim()
    : "";
}

function parseTable(source: string) {
  const result: Record<string, string> = {};
  for (const line of source.split("\n")) {
    const row = line.match(/^\|\s*([^|]+?)\s*\|\s*(.*?)\s*\|$/);
    if (!row) continue;
    const key = stripMarkdown(row[1]);
    const value = stripMarkdown(row[2]);
    if (key === "字段" || /^-+$/.test(key)) continue;
    result[key] = value;
  }
  return result;
}

function parseBullets(source: string) {
  return source
    .split("\n")
    .filter((line) => line.trim().startsWith("- "))
    .map((line) => stripMarkdown(line.trim().slice(2)));
}

function parseFaq(source: string) {
  const faqs: Faq[] = [];
  const relatedIndex = source.search(/^\*\*(Related games|中文相关推荐)/m);
  const faqSource = relatedIndex >= 0 ? source.slice(0, relatedIndex) : source;
  const chunks = faqSource.split(/^\*\*([^*\n]+)\*\*\s*$/m);
  for (let index = 1; index < chunks.length; index += 2) {
    const answer = chunks[index + 1]?.trim().split(/\n\s*\n/)[0] ?? "";
    if (!answer) continue;
    faqs.push({
      question: stripMarkdown(chunks[index]),
      answer: stripMarkdown(answer),
    });
  }
  return faqs;
}

function parseRelatedSlugs(source: string) {
  return [...source.matchAll(/\/(?:\{locale\}|en|zh)\/games\/([a-z0-9-]+)/g)].map(
    (match) => match[1],
  );
}

function parseEnglishLocale(section: string, name: string): GameLocale & { slug: string } {
  const table = parseTable(
    sectionBetween(section, /### 页面与 SEO\s*/, /### 游戏设计/),
  );
  const publicCopy = sectionBetween(
    section,
    /### 页面公开正文\s*/,
    /### 关键验收测试/,
  );
  const about = sectionBetween(publicCopy, /#### About[^\n]*\s*/, /#### How to play/);
  const howTo = sectionBetween(publicCopy, /#### How to play\s*/, /#### Tips/);
  const tips = sectionBetween(publicCopy, /#### Tips\s*/, /#### FAQ/);
  const faq = sectionAfter(publicCopy, /#### FAQ\s*/);
  const slug = table["Logical route suffix"]?.split("/").filter(Boolean).at(-1) ?? "";
  const cardCopy = table["Homepage card copy"] ?? "";

  return {
    slug,
    name,
    keyword: table["Primary keyword"] ?? "",
    seoTitle: table["SEO Title"] ?? "",
    description: table["Meta description"] ?? "",
    h1: table.H1 ?? "",
    categories: (table.Categories ?? "").split(",").map(stripMarkdown).filter(Boolean),
    difficulty: table["Difficulty label"] ?? "",
    cardCopy,
    imageAlt: `${name} game cover — ${cardCopy}`,
    about: stripMarkdown(about),
    howTo: parseBullets(howTo),
    tips: parseBullets(tips),
    faq: parseFaq(faq),
    relatedSlugs: parseRelatedSlugs(faq),
  };
}

function parseChineseLocale(section: string): GameLocale {
  const table = parseTable(
    sectionBetween(section, /### 中文页面与 SEO\s*/, /### 中文 About/),
  );
  const about = sectionBetween(section, /### 中文 About\s*/, /### 中文玩法说明/);
  const howTo = sectionBetween(section, /### 中文玩法说明\s*/, /### 中文游戏技巧/);
  const tips = sectionBetween(section, /### 中文游戏技巧\s*/, /### 中文 FAQ/);
  const faq = sectionBetween(section, /### 中文 FAQ\s*/, /### 本地化验收补充/);

  return {
    name: table["中文显示名"] ?? "",
    keyword: table["中文主关键词"] ?? "",
    seoTitle: table["中文 SEO Title"] ?? "",
    description: table["中文 Meta description"] ?? "",
    h1: table["中文 H1"] ?? "",
    categories: (table["中文分类"] ?? "").split(",").map(stripMarkdown).filter(Boolean),
    difficulty: table["中文难度标签"] ?? "",
    cardCopy: table["中文首页卡片文案"] ?? "",
    imageAlt: table["中文图片 Alt"] ?? "",
    about: stripMarkdown(about),
    howTo: parseBullets(howTo),
    tips: parseBullets(tips),
    faq: parseFaq(faq),
    relatedSlugs: parseRelatedSlugs(faq),
  };
}

function gameSections(source: string) {
  const headings = [...source.matchAll(/^## G(\d{2}) · ([^\n]+)$/gm)];
  return headings.map((heading, index) => ({
    id: `G${heading[1]}`,
    number: Number(heading[1]),
    name: heading[2].trim(),
    body: source.slice(
      heading.index,
      headings[index + 1]?.index ?? source.length,
    ),
  }));
}

const partOne = sectionBetween(spec, /# 11\. G01–G20[^\n]*\s*/, /# 12\. SEO 实施细则/);
const partTwo = sectionBetween(spec, /# 9\. 新增 9 款游戏详细规格\s*/, /# 10\. SEO 实施细则/);
const partThree = spec.slice(spec.indexOf("# Part III："));

const english = [...gameSections(partOne), ...gameSections(partTwo)].sort(
  (a, b) => a.number - b.number,
);
const chinese = gameSections(partThree);

const games: GameRecord[] = english.map((game) => {
  const en = parseEnglishLocale(game.body, game.name);
  const zhSection = chinese.find((candidate) => candidate.number === game.number);
  if (!zhSection) throw new Error(`Missing Chinese section for ${game.id}`);
  const zh = parseChineseLocale(zhSection.body);
  const design = sectionBetween(game.body, /### 游戏设计\s*/, /### 实施要求/);
  const mechanic = design.match(/\*\*核心玩法：\*\*\s*([^\n]+)/)?.[1] ?? "";
  const controls = design.match(/\*\*操作：\*\*\s*([^\n]+)/)?.[1] ?? "";
  const rulesBlock = sectionBetween(design, /\*\*规则：\*\*\s*/, /\*\*计分与会话：\*\*/);
  const scoring = design.match(/\*\*计分与会话：\*\*\s*([^\n]+)/)?.[1] ?? "";
  const implementation = parseBullets(
    sectionBetween(game.body, /### 实施要求\s*/, /### 页面公开正文/),
  );
  const acceptance = parseBullets(
    sectionBetween(game.body, /### 关键验收测试\s*/, /### 封面生成/),
  );
  const coverPrompt = game.body.match(/Prompt:\s*\n([\s\S]*?)\nPost-process:/)?.[1]?.trim() ?? "";

  return {
    id: game.id,
    number: game.number,
    slug: en.slug,
    mechanic: stripMarkdown(mechanic),
    controls: stripMarkdown(controls),
    rules: parseBullets(rulesBlock),
    scoring: stripMarkdown(scoring),
    implementation,
    acceptance,
    coverPrompt,
    locales: { en, zh },
  };
});

const failures: string[] = [];
if (games.length !== 29) failures.push(`Expected 29 games, found ${games.length}`);
for (const game of games) {
  if (!game.slug) failures.push(`${game.id}: missing slug`);
  for (const locale of ["en", "zh"] as const) {
    const content = game.locales[locale];
    for (const field of ["name", "seoTitle", "description", "h1", "cardCopy", "about"] as const) {
      if (!content[field]) failures.push(`${game.id}/${locale}: missing ${field}`);
    }
    if (content.howTo.length < 3) failures.push(`${game.id}/${locale}: fewer than 3 how-to steps`);
    if (content.tips.length < 3) failures.push(`${game.id}/${locale}: fewer than 3 tips`);
    if (content.faq.length < 3) failures.push(`${game.id}/${locale}: fewer than 3 FAQs`);
  }
  if (!game.mechanic || !game.controls || game.rules.length < 3 || game.acceptance.length < 3) {
    failures.push(`${game.id}: incomplete mechanics or acceptance data`);
  }
}

if (failures.length) {
  throw new Error(`Spec extraction failed:\n${failures.join("\n")}`);
}

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(games, null, 2)}\n`);
console.log(`Generated ${games.length} bilingual games at ${outputPath}`);
