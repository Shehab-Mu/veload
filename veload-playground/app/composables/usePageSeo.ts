import { resolveSiteOrigin } from "#shared/utils/siteOrigin";

export interface PageSeoOptions {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  image?: string;
}

export function usePageSeo(options: PageSeoOptions) {
  const config = useRuntimeConfig();
  const requestUrl = useRequestURL();
  const siteOrigin = resolveSiteOrigin(config.public.siteUrl, requestUrl.origin);
  const canonical = new URL(options.path, `${siteOrigin}/`).href;
  const image = new URL(options.image ?? "/og-image.png", `${siteOrigin}/`).href;

  useHead({
    link: [{ rel: "canonical", href: canonical }],
  });

  useSeoMeta({
    title: options.title,
    description: options.description,
    ogTitle: options.title,
    ogDescription: options.description,
    ogType: options.type ?? "website",
    ogUrl: canonical,
    ogSiteName: "Veload",
    ogImage: image,
    ogImageAlt: "Veload — accessible Vue 3 loading components",
    twitterCard: "summary_large_image",
    twitterTitle: options.title,
    twitterDescription: options.description,
    twitterImage: image,
  });

  return { canonical, image, siteUrl: siteOrigin };
}

