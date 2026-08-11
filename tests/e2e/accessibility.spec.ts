import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const representativePaths = [
  "/en",
  "/zh",
  "/en/category/brain",
  "/zh/collections/garden-logic",
  "/en/games/block-bloom",
  "/zh/games/sum-orchard",
  "/en/privacy",
  "/zh/accessibility",
];

test("representative localized pages have no serious axe violations", async ({ page }) => {
  test.setTimeout(90_000);

  for (const path of representativePaths) {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      results.violations.filter(
        (violation) => violation.impact === "serious" || violation.impact === "critical",
      ),
      path,
    ).toEqual([]);
  }
});

test("runtime controls expose names, state, and keyboard focus", async ({ page }) => {
  await page.goto("/en/games/sum-orchard");
  await page.getByRole("button", { name: "Play game" }).click();

  const pause = page.getByRole("button", { name: "Pause", exact: true });
  const contrast = page.getByRole("button", { name: "High contrast", exact: true });
  await expect(pause).toHaveAttribute("aria-pressed", "false");
  await expect(contrast).toHaveAttribute("aria-pressed", "false");

  await pause.focus();
  await expect(pause).toBeFocused();
  await page.keyboard.press("Enter");
  const resume = page.getByRole("button", { name: "Resume", exact: true }).first();
  await expect(resume).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('[role="status"]')).toContainText("Paused");
  await page.getByRole("dialog").getByRole("button", { name: "Resume" }).click();

  await contrast.focus();
  await page.keyboard.press("Space");
  await expect(contrast).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".game-shell")).toHaveClass(/is-high-contrast/);
});
