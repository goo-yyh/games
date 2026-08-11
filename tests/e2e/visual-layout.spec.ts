import { expect, test } from "@playwright/test";
import gamesData from "../../src/content/games.generated.json" with { type: "json" };

const games = gamesData as { id: string; slug: string }[];

test.describe("29-game visual layout evidence", () => {
  for (const game of games) {
    test(`${game.id} ${game.slug} fits the game viewport without overlays`, async ({ page }, testInfo) => {
      test.skip(!["chromium-desktop", "mobile-chrome"].includes(testInfo.project.name), "visual evidence uses the two specification viewports");
      await page.goto(`/en/games/${game.slug}`);
      await page.getByRole("button", { name: "Play game" }).click();
      const shell = page.locator(".game-shell");
      const stage = page.locator(".game-stage");
      await expect(shell).toBeVisible();
      await stage.scrollIntoViewIfNeeded();
      await page.waitForTimeout(120);

      const dimensions = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);

      const stageBox = await stage.boundingBox();
      expect(stageBox).not.toBeNull();
      expect(stageBox!.width).toBeGreaterThanOrEqual(300);
      expect(stageBox!.width).toBeLessThanOrEqual(dimensions.clientWidth);
      expect(stageBox!.height).toBeGreaterThanOrEqual(400);

      const adBoxes = await page.locator(".ad-slot, .ad-placeholder").evaluateAll((elements) => elements.map((element) => {
        const rect = element.getBoundingClientRect();
        return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
      }));
      for (const ad of adBoxes) {
        const overlaps = ad.left < stageBox!.x + stageBox!.width && ad.right > stageBox!.x && ad.top < stageBox!.y + stageBox!.height && ad.bottom > stageBox!.y;
        expect(overlaps).toBe(false);
      }

      await shell.screenshot({ path: testInfo.outputPath(`${game.id}-${game.slug}.png`), animations: "disabled" });
    });
  }
});
