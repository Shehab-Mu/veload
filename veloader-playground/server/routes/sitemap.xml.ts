import { defineEventHandler, getRequestURL, setHeader } from "h3";
import { resolveSiteOrigin } from "#shared/utils/siteOrigin";
import { loaders } from "#shared/data/loaders";
import { skeletonDetails } from "#shared/data/skeletons";

/**
 * Every public route of the documentation site.
 *
 * The list is derived from the shared catalogue so the sitemap can never fall
 * behind the pages that actually exist.
 */
export function documentationRoutes(): Array<{
  path: string;
  changefreq: string;
  priority: string;
}> {
  const staticRoutes = [
    { path: "/", changefreq: "weekly", priority: "1.0" },
    { path: "/loaders", changefreq: "weekly", priority: "0.9" },
    { path: "/skeletons", changefreq: "weekly", priority: "0.9" },
    { path: "/docs/installation", changefreq: "monthly", priority: "0.8" },
    { path: "/docs/accessibility", changefreq: "monthly", priority: "0.7" },
    { path: "/docs/api", changefreq: "monthly", priority: "0.8" },
  ];

  const loaderRoutes = loaders.map((loader) => ({
    path: `/loaders/${loader.slug}`,
    changefreq: "monthly",
    priority: "0.6",
  }));

  const skeletonRoutes = skeletonDetails.map((preset) => ({
    path: `/skeletons/${preset.slug}`,
    changefreq: "monthly",
    priority: "0.6",
  }));

  return [...staticRoutes, ...loaderRoutes, ...skeletonRoutes];
}

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);
  const requestUrl = getRequestURL(event);
  const siteUrl = resolveSiteOrigin(config.public.siteUrl, requestUrl.origin);

  const today = new Date().toISOString().slice(0, 10);

  const entries = documentationRoutes()
    .map(
      (route) => `  <url>
    <loc>${new URL(route.path, siteUrl).href}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`,
    )
    .join("\n");

  setHeader(event, "content-type", "application/xml; charset=utf-8");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
});
