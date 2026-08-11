import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import gamesData from "../../src/content/games.generated.json" with { type: "json" };

const games = gamesData as { slug: string }[];

const categories = ["puzzle", "arcade", "skill", "brain"];
const legal = ["about", "contact", "privacy", "cookies", "terms", "accessibility"];
const paths = [
  "", ...categories.map((value) => `/category/${value}`), "/collections/garden-logic",
  ...legal.map((value) => `/${value}`), ...games.map((game) => `/games/${game.slug}`),
];

test("all 82 localized public routes respond", async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "Run the complete route matrix once.");
  test.setTimeout(180_000);
  for (const locale of ["en", "zh"]) {
    for (const path of paths) {
      const response = await request.get(`/${locale}${path}`);
      expect(response.status(), `${locale}${path}`).toBe(200);
    }
  }
  const root = await request.get("/", { maxRedirects: 0 });
  expect([307, 308]).toContain(root.status());
  expect(root.headers().location).toBe("/en");
  for (const path of ["/ads.txt", "/robots.txt", "/sitemap.xml"]) {
    expect((await request.get(path)).status(), path).toBe(200);
  }
  for (const path of ["/fr", "/en/games/not-a-game", "/zh/category/not-a-category", "/en/not-a-page"]) {
    expect((await request.get(path)).status(), path).toBe(404);
  }
});

test("home pages expose localized catalog, metadata and no horizontal overflow", async ({ page }) => {
  for (const locale of ["en", "zh"] as const) {
    await page.goto(`/${locale}`);
    await expect(page.locator("html")).toHaveAttribute("lang", locale === "en" ? "en" : "zh-CN");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("#games .game-card")).toHaveCount(29);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`/${locale}$`));
    await expect(page.locator('link[hreflang="en"]')).toHaveCount(1);
    await expect(page.locator('link[hreflang="zh-CN"]')).toHaveCount(1);
    await expect(page.locator('link[hreflang="x-default"]')).toHaveCount(1);
    await expect(page.locator('meta[name="keywords"]')).toHaveCount(0);
    expect(await page.locator('script[type="application/ld+json"]').textContent()).toContain('"Organization"');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
  }
});

test("game structured data is localized and complete", async ({ page }) => {
  for (const locale of ["en", "zh"] as const) {
    await page.goto(`/${locale}/games/block-bloom`);
    const jsonLd = page.locator('script[type="application/ld+json"]');
    const structuredData = await jsonLd.textContent();
    expect(structuredData).toContain('"WebPage"');
    expect(structuredData).toContain('"BreadcrumbList"');
    expect(structuredData).toContain('"VideoGame"');
    expect(structuredData).toContain(locale === "en" ? '"inLanguage":"en"' : '"inLanguage":"zh-CN"');
  }
});

test("Matter physics stays out of the initial game page and loads after Play", async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "The production chunk boundary only needs one browser proof.");
  await page.goto("/en/games/hook-swing");
  const initialScripts = await page.evaluate(() => performance.getEntriesByType("resource").map((entry) => entry.name).filter((url) => url.includes("/_next/static/chunks/") && url.endsWith(".js")));
  const initialBodies = await Promise.all(initialScripts.map(async (url) => (await request.get(url)).text()));
  expect(initialBodies.join("\n")).not.toContain("Engine.create");

  await page.getByRole("button", { name: "Play game" }).click();
  await expect(page.locator(".hook-stage")).toBeVisible();
  const loadedScripts = await page.evaluate(() => performance.getEntriesByType("resource").map((entry) => entry.name).filter((url) => url.includes("/_next/static/chunks/") && url.endsWith(".js")));
  const addedScripts = loadedScripts.filter((url) => !initialScripts.includes(url));
  const addedBodies = await Promise.all(addedScripts.map(async (url) => (await request.get(url)).text()));
  expect(addedBodies.join("\n")).toContain("Engine.create");
});

test("language switch preserves the logical page", async ({ page }) => {
  await page.goto("/en/games/block-bloom");
  await page.getByRole("link", { name: "简体中文" }).click();
  await expect(page).toHaveURL(/\/zh\/games\/block-bloom$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("方块绽放");
});

test("representative pages have no serious axe violations", async ({ page }, testInfo) => {
  test.skip(!["chromium-desktop", "mobile-chrome"].includes(testInfo.project.name));
  for (const path of ["/en", "/zh", "/en/games/block-bloom", "/zh/privacy"]) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations.filter((violation) => violation.impact === "serious" || violation.impact === "critical"), path).toEqual([]);
  }
});

test.describe("29 game launch and reset smoke tests", () => {
  for (const game of games) {
    test(`${game.slug} launches in both locales`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== "chromium-desktop", "Run the full engine matrix once.");
      test.setTimeout(60_000);
      const pageErrors: string[] = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));
      for (const locale of ["en", "zh"] as const) {
        await page.goto(`/${locale}/games/${game.slug}`);
        await page.getByRole("button", { name: locale === "en" ? "Play game" : "开始游戏" }).click();
        await expect(page.locator(".game-shell")).toBeVisible();
        await expect(page.locator(".game-shell-title small")).toHaveText(locale === "en" ? "Playing" : "进行中");
        await page.locator(".game-stage").press("Space").catch(() => undefined);
        await page.waitForTimeout(80);
        await page.getByRole("button", { name: locale === "en" ? "Restart" : "重新开始", exact: true }).click();
        await expect(page.locator(".game-score strong")).toHaveText(/^(0|1250)$/);
      }
      expect(pageErrors).toEqual([]);
    });
  }
});
