import { resolveSiteOrigin } from "#shared/utils/siteOrigin";

export interface PageSeoOptions {
  /** Page title without the site suffix. */
  title: string;
  /** Meta description and Open Graph description. */
  description: string;
  /** Site relative path of the page, used for the canonical URL. */
  path: string;
  /** Open Graph type. */
  type?: "website" | "article";
  /** Site relative path of the social preview image. */
  image?: string;
}

/**
 * Applies the shared metadata of a documentation page.
 *
 * Titles, descriptions, canonical links, Open Graph and Twitter cards are
 * derived from the same options so they can never disagree.
 */
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
    ogSiteName: "Veloader",
    ogImage: image,
    ogImageAlt: "Veloader — accessible Vue 3 loading components",
    twitterCard: "summary_large_image",
    twitterTitle: options.title,
    twitterDescription: options.description,
    twitterImage: image,
  });

  return { canonical, image, siteUrl: siteOrigin };
}

