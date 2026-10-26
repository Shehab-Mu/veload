
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],

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
