import { describe, expect, it } from "vitest";
import { games } from "../../src/content/games";
import { gameText, gameUi } from "../../src/i18n/game-ui";

function placeholders(value: string) {
  return [...value.matchAll(/\{([a-zA-Z][a-zA-Z0-9]*)\}/g)].map((match) => match[1]).sort();
}

describe("runtime game UI dictionaries", () => {
  it("covers exactly the 29 public slugs", () => {
    expect(Object.keys(gameUi).sort()).toEqual(games.map((game) => game.slug).sort());
  });

  const entries = Object.entries(gameUi) as [string, { en: Record<string, string>; zh: Record<string, string> }][];

  it.each(entries)("keeps English and Chinese keys and parameters symmetric for %s", (_slug, copy) => {
    expect(Object.keys(copy.en).sort()).toEqual(Object.keys(copy.zh).sort());
    for (const key of Object.keys(copy.en)) {
      expect(copy.en[key].trim()).not.toBe("");
      expect(copy.zh[key].trim()).not.toBe("");
      expect(copy.zh[key]).not.toBe(copy.en[key]);
      expect(placeholders(copy.zh[key])).toEqual(placeholders(copy.en[key]));
    }
  });

  it("formats typed parameter templates without leaving placeholders", () => {
    expect(gameText("penalty-hero", "en", "shotProgress", { current: 3 })).toBe("Shot 3 of 5");
    expect(gameText("penalty-hero", "zh", "shotProgress", { current: 3 })).toBe("第 3/5 次射门");
    expect(gameText("neon-snake", "zh", "length")).toBe("长度");
  });
});
