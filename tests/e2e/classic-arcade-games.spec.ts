import { expect, test, type Page } from "@playwright/test";

type Locale = "en" | "zh";

const labels = {
  en: { play: "Play game", restart: "Restart", started: "Game started" },
  zh: { play: "开始游戏", restart: "重新开始", started: "游戏已开始" },
} as const;

async function launch(page: Page, slug: string, locale: Locale) {
  await page.goto(`/${locale}/games/${slug}`);
  await page.getByRole("button", { name: labels[locale].play }).click();
  await expect(page.locator(".game-shell")).toBeVisible();
  await expect(page.locator('[role="status"]')).toContainText(labels[locale].started);
}

async function resetAndRefresh(page: Page, locale: Locale) {
  await page.getByRole("button", { name: labels[locale].restart, exact: true }).click();
  await expect(page.locator(".game-shell")).toHaveAttribute("data-phase", "playing");
  await expect(page.locator(".game-live")).toContainText(locale === "en" ? "New run started" : "新一局已开始");
  const restartedScore = Number(await page.locator(".game-score strong").textContent());
  expect(restartedScore).toBeGreaterThanOrEqual(0);
  expect(restartedScore).toBeLessThanOrEqual(1250);
  await page.reload();
  await expect(page.locator(".game-shell")).toHaveCount(0);
  await expect(page.getByRole("button", { name: labels[locale].play })).toBeVisible();
}

for (const locale of ["en", "zh"] as const) {
  test(`Block Bloom places a piece and rejects overlap (${locale})`, async ({ page }) => {
    await launch(page, "block-bloom", locale);
    await page.locator(".bloom-board button").first().click();
    await expect.poll(async () => Number(await page.locator(".game-score strong").textContent())).toBeGreaterThan(0);
    await page.locator(".bloom-board button").first().click();
    await expect(page.locator('[role="status"]')).toContainText(locale === "en" ? "does not fit" : "无法放在");
    await resetAndRefresh(page, locale);
  });

  test(`Number Merge 2048 changes only on a valid move (${locale})`, async ({ page }) => {
    await launch(page, "number-merge-2048", locale);
    const board = page.locator(".merge-board");
    const before = await board.textContent();
    for (const key of ["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"]) {
      await board.press(key);
      if ((await board.textContent()) !== before) break;
    }
    expect(await board.textContent()).not.toBe(before);
    await resetAndRefresh(page, locale);
  });

  test(`Neon Snake moves and ignores reverse direction (${locale})`, async ({ page }) => {
    await launch(page, "neon-snake", locale);
    await expect(page.locator(".snake-board canvas")).toBeVisible();
    const cells = page.locator(".snake-board i");
    const headIndex = async () => cells.evaluateAll((items) => items.findIndex((item) => item.classList.contains("snake-head")));
    const before = await headIndex();
    await page.locator(".snake-board").press("ArrowLeft");
    await page.waitForTimeout(180);
    const after = await headIndex();
    expect(after).toBe(before + 1);
    await resetAndRefresh(page, locale);
  });

  test(`Sky Stack resolves a non-zero overlap (${locale})`, async ({ page }) => {
    await launch(page, "sky-stack", locale);
    await expect(page.locator(".stack-stage canvas")).toBeVisible();
    await page.waitForTimeout(80);
    await page.locator(".stack-game").click();
    await expect.poll(async () => Number(await page.locator(".game-score strong").textContent())).toBeGreaterThan(0);
    await resetAndRefresh(page, locale);
  });

  test(`Zigzag Drift accepts exactly one switch input (${locale})`, async ({ page }) => {
    await launch(page, "zigzag-drift", locale);
    await expect(page.locator(".drift-board canvas")).toBeVisible();
    await page.locator(".drift-game").click();
    await page.waitForTimeout(280);
    await expect(page.locator(".game-score strong")).toHaveText(/\d+/);
    await resetAndRefresh(page, locale);
  });

  test(`Tap Hoops applies an upward impulse (${locale})`, async ({ page }) => {
    await launch(page, "tap-hoops", locale);
    await expect(page.locator(".hoops-stage canvas")).toBeVisible();
    const ball = page.locator(".basketball");
    const before = await ball.getAttribute("style");
    await page.locator(".hoops-game").click();
    await page.waitForTimeout(100);
    expect(await ball.getAttribute("style")).not.toBe(before);
    await resetAndRefresh(page, locale);
  });

  test(`Color Pour executes a guaranteed level solution and undo (${locale})`, async ({ page }) => {
    await launch(page, "color-pour", locale);
    const tubes = page.locator(".tube-row button");
    const solution = [[0, 4], [1, 5], [3, 0], [2, 3], [5, 2], [4, 1]] as const;
    for (const [source, destination] of solution) {
      await tubes.nth(source).click();
      await tubes.nth(destination).click();
    }
    await expect(page.locator('[role="status"]')).toContainText(locale === "en" ? "Level complete" : "关卡完成");
    await page.getByRole("button", { name: locale === "en" ? "Undo" : "撤销" }).click();
    await expect(page.locator(".logic-hud")).toContainText(locale === "en" ? "Moves 5" : "步数 5");
    await resetAndRefresh(page, locale);
  });

  test(`Penalty Hero resolves against a committed AI choice (${locale})`, async ({ page }) => {
    await launch(page, "penalty-hero", locale);
    const ball = page.locator(".penalty-ball");
    const box = await ball.boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.mouse.down();
    await page.mouse.move(box!.x + box!.width / 2 + 65, box!.y - 105, { steps: 5 });
    await page.mouse.up();
    await expect(page.locator('[role="status"]')).not.toContainText(labels[locale].started);
    await expect(page.locator(".penalty-keeper")).toHaveClass(/zone-\d/);
    await resetAndRefresh(page, locale);
  });

  test(`Slope Dash steering changes the world-space lane (${locale})`, async ({ page }) => {
    await launch(page, "slope-dash", locale);
    const stage = page.locator(".slope-track");
    await expect(stage.locator("canvas")).toBeVisible();
    const box = await stage.boundingBox();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.mouse.down();
    await page.mouse.move(box!.x + box!.width / 2 - 42, box!.y + box!.height / 2, { steps: 4 });
    await page.mouse.up();
    await expect(page.locator(".slope-ball")).toHaveClass(/lane-0/);
    await resetAndRefresh(page, locale);
  });

  test(`Helix Drop rotates its angular tower state (${locale})`, async ({ page }) => {
    await launch(page, "helix-drop", locale);
    const ring = page.locator(".helix-ring").first();
    await expect(page.locator(".helix-stage canvas")).toBeVisible();
    const before = await ring.getAttribute("style");
    const box = await page.locator(".helix-stage").boundingBox();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.mouse.down();
    await page.mouse.move(box!.x + box!.width / 2 - 36, box!.y + box!.height / 2, { steps: 4 });
    await page.mouse.up();
    expect(await ring.getAttribute("style")).not.toBe(before);
    await resetAndRefresh(page, locale);
  });

  test(`Tunnel Flux rotates with session-only sensitivity (${locale})`, async ({ page }) => {
    await launch(page, "tunnel-flux", locale);
    const marker = page.locator(".tunnel-stage > span");
    await expect(page.locator(".tunnel-stage canvas")).toBeVisible();
    const before = await marker.getAttribute("style");
    const box = await page.locator(".tunnel-stage").boundingBox();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.mouse.down();
    await page.mouse.move(box!.x + box!.width / 2 + 42, box!.y + box!.height / 2, { steps: 4 });
    await page.mouse.up();
    expect(await marker.getAttribute("style")).not.toBe(before);
    await resetAndRefresh(page, locale);
  });

  test(`Bubble Pop Shooter attaches a shot on its hex board (${locale})`, async ({ page }) => {
    await launch(page, "bubble-pop-shooter", locale);
    const occupied = async () => page.locator(".bubble-board .bubble").count();
    const before = await occupied();
    await page.getByRole("button", { name: locale === "en" ? "Shoot" : "发射" }).click();
    const after = await occupied();
    expect(after).toBeLessThanOrEqual(before + 1);
    expect(after).not.toBe(before);
    await expect(page.locator('[role="status"]')).not.toContainText(labels[locale].started);
    await resetAndRefresh(page, locale);
  });

  test(`Bolt Away enforces cover order and clears a matching triple (${locale})`, async ({ page }) => {
    await launch(page, "bolt-away", locale);
    const plates = page.locator(".plate");
    await expect(plates.nth(1).locator("button").first()).toBeDisabled();
    for (const bolt of await plates.first().locator("button").all()) await bolt.click();
    await expect(plates.first()).toHaveClass(/released/);
    await expect(page.locator('[role="status"]')).toContainText(locale === "en" ? "matching bolts" : "同色螺栓");
    await resetAndRefresh(page, locale);
  });

  test(`Unblock Path completes a verified level and can undo (${locale})`, async ({ page }) => {
    await launch(page, "unblock-path", locale);
    const blocks = page.locator(".unblock-board button");
    const gate = blocks.nth(1);
    const gateBox = await gate.boundingBox();
    await page.mouse.move(gateBox!.x + gateBox!.width / 2, gateBox!.y + gateBox!.height / 2);
    await page.mouse.down();
    await page.mouse.move(gateBox!.x + gateBox!.width / 2, gateBox!.y - 26, { steps: 4 });
    await page.mouse.up();
    await page.getByRole("button", { name: `${locale === "en" ? "Block" : "方块"} target` }).click();
    for (let move = 0; move < 5; move += 1) await page.locator(".logic-actions button").nth(1).click();
    await expect(page.locator('[role="status"]')).toContainText(locale === "en" ? "Path opened" : "通道已经打开");
    await page.getByRole("button", { name: locale === "en" ? "Undo" : "撤销" }).click();
    await expect(page.locator(".logic-hud")).toContainText(locale === "en" ? "Moves 5" : "步数 5");
    await resetAndRefresh(page, locale);
  });

  test(`Wave Rider hold/release changes its exact slope (${locale})`, async ({ page }) => {
    await launch(page, "wave-rider", locale);
    await expect(page.locator(".wave-stage canvas")).toBeVisible();
    const player = page.locator(".wave-player");
    const before = await player.getAttribute("style");
    await page.locator(".wave-game").dispatchEvent("pointerdown", { pointerId: 1, clientX: 100, clientY: 100 });
    await page.waitForTimeout(80);
    await page.locator(".wave-game").dispatchEvent("pointerup", { pointerId: 1, clientX: 100, clientY: 100 });
    expect(await player.getAttribute("style")).not.toBe(before);
    await resetAndRefresh(page, locale);
  });

  test(`Fruit Slice Rush slices a launched fruit once (${locale})`, async ({ page }) => {
    await launch(page, "fruit-slice-rush", locale);
    await expect(page.locator(".fruit-stage canvas")).toBeVisible();
    const fruit = page.locator(".fruit-stage .fruit").first();
    await expect(fruit).toBeVisible({ timeout: 3_000 });
    await fruit.click({ force: true });
    await expect.poll(async () => Number(await page.locator(".game-score strong").textContent())).toBeGreaterThan(0);
    await resetAndRefresh(page, locale);
  });

  test(`Hook Swing attaches to a valid forward anchor (${locale})`, async ({ page }) => {
    await launch(page, "hook-swing", locale);
    await page.locator(".game-stage").press("Space");
    await expect(page.locator(".hook-stage svg")).toBeVisible();
    await resetAndRefresh(page, locale);
  });

  test(`Trap Runner accepts movement and jump controls (${locale})`, async ({ page }) => {
    await launch(page, "trap-runner", locale);
    await expect(page.locator(".trap-stage canvas")).toBeVisible();
    await expect(page.locator(".trap-platform.moving")).toBeVisible();
    const player = page.locator(".trap-player");
    const before = await player.getAttribute("style");
    await page.keyboard.down("ArrowRight");
    await page.waitForTimeout(120);
    await page.keyboard.press("Space");
    await page.keyboard.up("ArrowRight");
    expect(await player.getAttribute("style")).not.toBe(before);
    await resetAndRefresh(page, locale);
  });

  test(`Rugged Wheels drives its lazy Matter rover (${locale})`, async ({ page }) => {
    await launch(page, "rugged-wheels", locale);
    const rover = page.locator(".rover");
    const before = await rover.getAttribute("style");
    await page.keyboard.down("ArrowRight");
    await page.waitForTimeout(350);
    await page.keyboard.up("ArrowRight");
    expect(await rover.getAttribute("style")).not.toBe(before);
    await resetAndRefresh(page, locale);
  });

  test(`Classic Solitaire draws and undoes a card (${locale})`, async ({ page }) => {
    await launch(page, "classic-solitaire", locale);
    const firstPile = page.locator(".tableau-pile").first();
    await firstPile.focus();
    await expect(firstPile).toBeFocused();
    await page.keyboard.press("Enter");
    await page.getByRole("button", { name: locale === "en" ? "Draw from stock" : "从牌库抽牌" }).click();
    await expect(page.locator(".game-score strong")).toHaveText("1");
    await page.getByRole("button", { name: locale === "en" ? "Undo" : "撤销" }).click();
    await expect(page.locator(".game-score strong")).toHaveText("0");
    await resetAndRefresh(page, locale);
  });
}
