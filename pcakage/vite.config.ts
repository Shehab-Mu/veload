
import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],

  test: {
    environment: "jsdom",
    include: ["src/tests/**/*.test.ts"],
  },

  build: {
    lib: {
      entry: "src/index.ts",
      name: "Veloader",
      formats: ["es", "cjs"],
      fileName: (format) =>
        format === "es" ? "index.js" : "index.cjs",
      cssFileName: "style",
    },

    rollupOptions: {
      external: ["vue"],
    },
  },
});
