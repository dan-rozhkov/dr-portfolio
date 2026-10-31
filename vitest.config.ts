import { defineConfig } from "vitest/config";

// Separate from vite.config.ts so the live-studio plugin stays out of tests.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
});
