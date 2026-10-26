import { defineNuxtConfig } from "nuxt/config";

/**
 * The Veloader documentation site.
 *
 * The site renders on the server (Nuxt SSR) and consumes the `veload`
 * package exactly like any other Vue 3 project would: components are imported
 * from the package entry point and the stylesheet is registered through the
 * Nuxt `css` option.
 */
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  ssr: true,
  devtools: { enabled: false },

  // `veload/style.css` contains the scoped styles of every component. The
  // package ships one stylesheet, so it is registered once, globally.
  css: ["veload/style.css", "~/assets/css/main.css"],

  app: {
    head: {
      htmlAttrs: { lang: "en" },
      titleTemplate: "%s · Veloader",
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
      // Override with NUXT_PUBLIC_SITE_URL: the real public HTTP(S) origin.
      // Head metadata, sitemap and robots share validation/normalization.
      // The request-origin fallback is for local work, not proxy deployments.
      siteUrl: "",
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
