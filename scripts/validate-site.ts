import { access, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { games } from "../src/content/games";
import { gameLoaders } from "../src/games/loaders";
import { locales } from "../src/i18n/config";
import sitemap from "../src/app/sitemap";

const failures: string[] = [];
const assert = (condition: unknown, message: string) => { if (!condition) failures.push(message); };
const slugs = new Set(games.map((game) => game.slug));
const uniqueFields = Object.fromEntries(
  locales.map((locale) => [locale, { seoTitle: new Set<string>(), description: new Set<string>(), h1: new Set<string>() }]),
) as Record<(typeof locales)[number], Record<"seoTitle" | "description" | "h1", Set<string>>>;

assert(locales.length === 2 && locales.includes("en") && locales.includes("zh"), "Locales must be exactly en and zh.");
assert(games.length === 29, `Expected 29 games, received ${games.length}.`);
assert(slugs.size === 29, "Game slugs must be unique.");
assert(Object.keys(gameLoaders).length === 29, `Expected 29 lazy game loaders, received ${Object.keys(gameLoaders).length}.`);
assert(Object.keys(gameLoaders).every((slug) => slugs.has(slug)), "Lazy game loader slugs must match the public catalog.");

for (const game of games) {
  for (const locale of locales) {
    const copy = game.locales[locale];
    assert(Boolean(copy), `${game.slug} is missing ${locale} content.`);
    if (!copy) continue;
    for (const key of ["name", "seoTitle", "description", "h1", "cardCopy", "about"] as const) {
      assert(copy[key].trim().length > 0, `${game.slug}.${locale}.${key} is empty.`);
    }
    assert(copy.howTo.length >= 3, `${game.slug}.${locale} needs at least three How to play steps.`);
    assert(copy.tips.length >= 3, `${game.slug}.${locale} needs at least three tips.`);
    const minimumFaqs = game.number >= 21 ? 4 : 3;
    assert(copy.faq.length >= minimumFaqs, `${game.slug}.${locale} needs at least ${minimumFaqs} FAQs.`);
    assert(copy.relatedSlugs.length >= (game.number >= 21 ? 4 : 3), `${game.slug}.${locale} needs enough related games.`);
    for (const key of ["seoTitle", "description", "h1"] as const) {
      assert(!uniqueFields[locale][key].has(copy[key]), `${game.slug}.${locale}.${key} duplicates another game.`);
      uniqueFields[locale][key].add(copy[key]);
    }
    assert(!/\{\{|\}\}|example\.com|coming soon/i.test(JSON.stringify(copy)), `${game.slug}.${locale} contains an unresolved placeholder.`);
    for (const related of copy.relatedSlugs) {
      assert(slugs.has(related), `${game.slug}.${locale} references missing related slug ${related}.`);
      assert(related !== game.slug, `${game.slug}.${locale} references itself.`);
    }
  }
  assert(game.locales.en.seoTitle !== game.locales.zh.seoTitle, `${game.slug} titles are not localized.`);
  assert(game.locales.en.description !== game.locales.zh.description, `${game.slug} descriptions are not localized.`);

  const directory = path.join(process.cwd(), "public/images/games", game.slug);
  for (const [name, width, height, maxBytes] of [["cover.webp", 1200, 675, 160_000], ["og.webp", 1200, 630, 180_000]] as const) {
    const file = path.join(directory, name);
    try {
      await access(file);
      const [metadata, info] = await Promise.all([sharp(file).metadata(), stat(file)]);
      assert(metadata.width === width && metadata.height === height, `${game.slug}/${name} must be ${width}x${height}.`);
      assert(info.size <= maxBytes, `${game.slug}/${name} exceeds ${Math.round(maxBytes / 1000)} KB.`);
    } catch {
      failures.push(`Missing image ${game.slug}/${name}.`);
    }
  }
  await access(path.join(directory, "source.png")).catch(() => failures.push(`Missing source image for ${game.slug}.`));
}

const sitemapEntries = sitemap();
assert(sitemapEntries.length === 82, `Sitemap must contain 82 entries, received ${sitemapEntries.length}.`);
assert(new Set(sitemapEntries.map((entry) => entry.url)).size === 82, "Sitemap URLs must be unique.");
for (const entry of sitemapEntries) {
  const languages = entry.alternates?.languages;
  assert(Boolean(languages?.en && languages?.["zh-CN"] && languages?.["x-default"]), `${entry.url} lacks complete language alternates.`);
}

if (process.env.NEXT_PUBLIC_ENABLE_ADSENSE === "true") {
  assert(/^ca-pub-\d+$/.test(process.env.NEXT_PUBLIC_ADSENSE_CLIENT || ""), "Enabled AdSense requires a valid client ID.");
  assert(/^pub-\d+$/.test(process.env.ADSENSE_PUBLISHER_ID || ""), "Enabled AdSense requires a valid publisher ID.");
}

if (process.env.NEXT_PUBLIC_LAUNCH_READY === "true") {
  assert(/^https:\/\/[^/]+$/.test(process.env.NEXT_PUBLIC_SITE_URL || ""), "Launch-ready builds require one canonical HTTPS origin without a trailing slash.");
  assert(Boolean(process.env.NEXT_PUBLIC_CONTACT_EMAIL) && process.env.NEXT_PUBLIC_CONTACT_EMAIL !== "hello@arcademint.games", "Launch-ready builds require the operator's real public contact email.");
  assert(Boolean(process.env.NEXT_PUBLIC_LEGAL_NAME) && process.env.NEXT_PUBLIC_LEGAL_NAME !== "ArcadeMint Studio", "Launch-ready builds require the reviewed legal operator name.");
  assert(Boolean(process.env.NEXT_PUBLIC_GOVERNING_LAW), "Launch-ready builds require the reviewed governing-law value.");
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated 29 games, 58 localized game pages, 82 sitemap URLs, and 87 game image files.`);
}
