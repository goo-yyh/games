import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? sourceFiles(path) : /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

describe("session-only game state", () => {
  it("does not write game state to browser persistence APIs", () => {
    const source = sourceFiles(join(process.cwd(), "src")).map((path) => readFileSync(path, "utf8")).join("\n");
    expect(source).not.toMatch(/\b(?:localStorage|sessionStorage)\.(?:setItem|removeItem|clear)\b|\bindexedDB\.open\b|document\.cookie\s*=/);
  });
});
