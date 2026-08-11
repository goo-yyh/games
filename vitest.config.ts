import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": new URL("./src", import.meta.url).pathname } },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    coverage: {
      include: ["src/games/rules/**/*.ts", "src/games/logic/garden-rules.ts"],
      reporter: ["text", "html"],
      thresholds: { statements: 85, branches: 85, functions: 85, lines: 85 },
    },
  },
});
