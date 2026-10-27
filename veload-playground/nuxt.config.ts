import { defineNuxtConfig } from "nuxt/config";


export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  ssr: true,
  devtools: { enabled: false },


  css: ["veload/style.css", "~/assets/css/main.css"],

  app: {
    head: {
      htmlAttrs: { lang: "en" },
      titleTemplate: "%s · Veload",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "theme-color", content: "#120d21" },
      ],
      link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    },
  },

  runtimeConfig: {
    public: {

      siteUrl: "https://veload-playground.vercel.app",
    },
  },

  nitro: {
    compressPublicAssets: true,
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },
});
