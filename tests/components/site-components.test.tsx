// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GameGrid } from "../../src/components/GameGrid";
import { GameLauncher } from "../../src/components/GameLauncher";
import { Header } from "../../src/components/Header";
import { games, toGameCardData } from "../../src/content/games";

vi.mock("next/navigation", async () => {
  const actual = await vi.importActual<typeof import("next/navigation")>("next/navigation");
  return { ...actual, usePathname: () => "/en/games/block-bloom" };
});

afterEach(() => cleanup());

describe("site component contracts", () => {
  it("opens, traps and closes the mobile navigation with Escape", async () => {
    render(<Header locale="en" gameSlugs={["block-bloom", "neon-snake"]} />);
    const menu = screen.getByRole("button", { name: "Open menu" });
    fireEvent.click(menu);
    expect(screen.getByRole("dialog", { name: "Open menu" })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(menu).toHaveFocus();
  });

  it("preserves the logical path in the locale switch", () => {
    render(<Header locale="en" gameSlugs={["block-bloom"]} />);
    expect(screen.getByRole("link", { name: /简体中文/ })).toHaveAttribute("href", "/zh/games/block-bloom");
  });

  it("searches and filters localized game cards", () => {
    const sample = games.filter((game) => ["block-bloom", "neon-snake"].includes(game.slug)).map(toGameCardData);
    render(<GameGrid games={sample} locale="en" searchable />);
    expect(screen.getByRole("heading", { name: "Block Bloom" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Neon Snake" })).toBeInTheDocument();
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "snake" } });
    expect(screen.queryByRole("heading", { name: "Block Bloom" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Neon Snake" })).toBeInTheDocument();
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Puzzle" }));
    expect(screen.getByRole("heading", { name: "Block Bloom" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Neon Snake" })).not.toBeInTheDocument();
  });

  it("keeps the game engine unloaded until Play and supports runtime pause and restart", async () => {
    render(<GameLauncher slug="block-bloom" name="Block Bloom" locale="en" />);
    expect(screen.queryByText("Score", { selector: "small" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Play game" }));
    const pause = await screen.findByRole("button", { name: "Pause" });
    fireEvent.click(pause);
    const controls = within(document.querySelector(".game-shell-controls")!);
    expect(controls.getByRole("button", { name: "Resume" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(controls.getByRole("button", { name: "Restart" }));
    expect(screen.getByText("0", { selector: ".game-score strong" })).toBeInTheDocument();
  });
});
