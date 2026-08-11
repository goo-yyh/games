import { describe, expect, it } from "vitest";
import { games } from "../../src/content/games";
import { locales } from "../../src/i18n/config";

describe("bilingual game catalog", () => {
  it("contains exactly 29 unique games and two locales", () => {
    expect(locales).toEqual(["en", "zh"]);
    expect(games).toHaveLength(29);
    expect(new Set(games.map((game) => game.slug)).size).toBe(29);
  });
  it.each(games.map((game) => [game.slug, game] as const))("has complete localized copy for %s", (_slug, game) => {
    for (const locale of locales) {
      const copy = game.locales[locale];
      expect(copy.name).toBeTruthy(); expect(copy.seoTitle).toBeTruthy(); expect(copy.description).toBeTruthy();
      expect(copy.h1).toBeTruthy(); expect(copy.cardCopy).toBeTruthy(); expect(copy.about).toBeTruthy();
      expect(copy.howTo.length).toBeGreaterThanOrEqual(3); expect(copy.tips.length).toBeGreaterThanOrEqual(3); expect(copy.faq.length).toBeGreaterThanOrEqual(game.number >= 21 ? 4 : 3);
      expect(copy.relatedSlugs.length).toBeGreaterThanOrEqual(game.number >= 21 ? 4 : 3);
      expect(copy.relatedSlugs).not.toContain(game.slug);
      copy.relatedSlugs.forEach((related) => expect(games.some((item) => item.slug === related)).toBe(true));
    }
    expect(game.locales.en.seoTitle).not.toBe(game.locales.zh.seoTitle);
    expect(game.locales.en.description).not.toBe(game.locales.zh.description);
  });
  it.each(locales)("keeps %s SEO titles, descriptions and H1s unique", (locale) => {
    for (const key of ["seoTitle", "description", "h1"] as const) {
      expect(new Set(games.map((game) => game.locales[locale][key])).size).toBe(29);
    }
  });
});
