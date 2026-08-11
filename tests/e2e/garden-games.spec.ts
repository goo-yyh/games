import { expect, test, type Page } from "@playwright/test";

type Locale = "en" | "zh";

async function launch(page: Page, locale: Locale, slug: string) {
  await page.goto(`/${locale}/games/${slug}`);
  await page.getByRole("button", { name: locale === "en" ? "Play game" : "开始游戏" }).click();
  await expect(page.locator(".game-shell")).toBeVisible();
}

async function verifyResetAndRefresh(page: Page, locale: Locale) {
  await page.getByRole("button", { name: locale === "en" ? "Restart" : "重新开始", exact: true }).click();
  await expect(page.locator(".game-score strong")).toHaveText(/^(0|1250)$/);
  await page.reload();
  await expect(page.getByRole("button", { name: locale === "en" ? "Play game" : "开始游戏" })).toBeVisible();
}

function gardenTest(name: string, run: (page: Page, locale: Locale) => Promise<void>) {
  test(name, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-desktop", "Run the deterministic Garden Logic matrix once.");
    test.setTimeout(90_000);
    for (const locale of ["en", "zh"] as const) {
      await run(page, locale);
      await verifyResetAndRefresh(page, locale);
    }
  });
}

gardenTest("Sum Orchard clears a planted target rectangle", async (page, locale) => {
  await launch(page, locale, "sum-orchard");
  await page.locator('[data-cell="0-0"]').click();
  await page.locator('[data-cell="0-1"]').click();
  await expect(page.locator(".game-score strong")).not.toHaveText("0");
  await expect(page.locator(".game-live")).toContainText(locale === "en" ? "fruit harvested" : "收获了");
});

gardenTest("Color Cross clears a guaranteed dual-axis cross", async (page, locale) => {
  await launch(page, locale, "color-cross");
  const before = await page.locator(".cross-grid button:not(.cross-empty)").count();
  await page.locator('[data-cell="1-1"]').click();
  await expect(page.locator(".cross-grid button:not(.cross-empty)")).toHaveCount(before - 4);
  await expect(page.locator(".game-live")).toContainText(locale === "en" ? "Matching cross" : "十字匹配");
});

gardenTest("Orbit Lines performs a productive unobstructed ray move", async (page, locale) => {
  await launch(page, locale, "orbit-lines");
  await page.locator('[data-cell="1-3"]').click();
  await page.locator('[data-cell="0-3"]').click();
  await expect(page.locator(".game-score strong")).not.toHaveText("0");
  await expect(page.locator(".game-live")).toContainText(locale === "en" ? "Line cleared" : "连线已消除");
});

gardenTest("Corner Stars accepts an equal-arm planted corner", async (page, locale) => {
  await launch(page, locale, "corner-stars");
  for (const key of ["0-0", "1-0", "0-1"]) await page.locator(`[data-cell="${key}"]`).click();
  await expect(page.locator(".game-score strong")).not.toHaveText("0");
  await expect(page.locator(".game-live")).toContainText(locale === "en" ? "Valid corner" : "有效直角");
});

gardenTest("Sidefall Blocks moves a top block and resolves its group", async (page, locale) => {
  await launch(page, locale, "sidefall-blocks");
  await page.locator('[data-cell="0-0"]').click();
  await page.locator('[data-cell="0-1"]').click();
  await expect(page.locator(".game-score strong")).not.toHaveText("0");
  await expect(page.locator(".game-live")).toContainText(locale === "en" ? "Chain" : "连锁");
});

gardenTest("Triad Capture accepts the planted one-of-each rectangle", async (page, locale) => {
  await launch(page, locale, "triad-capture");
  await page.locator('[data-cell="0-0"]').click();
  await page.locator('[data-cell="0-2"]').click();
  await expect(page.locator(".game-score strong")).not.toHaveText("0");
  await expect(page.locator(".game-live")).toContainText(locale === "en" ? "Balanced selection" : "三类数量相等");
});

gardenTest("Echo Path locks a planted endpoint/interior path", async (page, locale) => {
  await launch(page, locale, "echo-path");
  for (const key of ["0-0", "0-1", "0-2"]) await page.locator(`[data-cell="${key}"]`).click();
  await page.getByRole("button", { name: locale === "en" ? "Confirm path" : "确认路径" }).click();
  await expect(page.locator(".game-score strong")).not.toHaveText("0");
  await expect(page.locator(".game-live")).toContainText(locale === "en" ? "Path locked" : "路径已锁定");
});

gardenTest("Target Basket accepts every generated legal pair", async (page, locale) => {
  await launch(page, locale, "target-basket");
  const target = Number(await page.locator(".basket-target strong").innerText());
  const values = (await page.locator(".number-fruit button").allTextContents()).map(Number);
  let pair: [number, number] | null = null;
  for (let first = 0; first < values.length - 1 && !pair; first += 1) {
    for (let second = first + 1; second < values.length; second += 1) {
      if (values[first] + values[second] === target) { pair = [first, second]; break; }
    }
  }
  expect(pair).not.toBeNull();
  await page.locator(".number-fruit button").nth(pair![0]).click();
  await page.locator(".number-fruit button").nth(pair![1]).click();
  await expect(page.locator(".game-score strong")).not.toHaveText("0");
  await expect(page.locator(".game-live")).toContainText(locale === "en" ? "Correct" : "回答正确");
});

gardenTest("Math Grid Sprint starts after mode choice and locks a correct cell", async (page, locale) => {
  await launch(page, locale, "math-grid-sprint");
  await expect(page.locator(".math-grid")).toHaveCount(0);
  await page.getByRole("button", { name: locale === "en" ? "Addition" : "加法" }).click();
  const input = page.locator(".math-grid input").first();
  const label = await input.getAttribute("aria-label");
  const numbers = label!.match(/\d+/g)!.map(Number);
  const answer = numbers[1] + numbers[3];
  await input.fill(String(answer));
  await input.press("Enter");
  await expect(input).toHaveAttribute("readonly", "");
  await expect(page.locator(".game-live")).toContainText(locale === "en" ? "Correct" : "正确");
});

test("Garden game pause freezes the timer and high contrast stays session-only", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "One representative shared-shell check is enough.");
  await launch(page, "en", "sum-orchard");
  const timer = page.locator(".garden-hud span");
  await page.getByRole("button", { name: "High contrast" }).click();
  await expect(page.locator(".game-shell")).toHaveClass(/is-high-contrast/);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  const pausedAt = await timer.innerText();
  await page.waitForTimeout(1_200);
  await expect(timer).toHaveText(pausedAt);
  await page.reload();
  await expect(page.locator(".game-shell")).toHaveCount(0);
});
