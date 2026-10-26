import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
  test: {
    environment: "nuxt",
    include: ["tests/**/*.test.ts"],
    globals: false,
  },
});
