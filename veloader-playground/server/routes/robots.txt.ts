import { defineEventHandler, getRequestURL, setHeader } from "h3";
import { resolveSiteOrigin } from "#shared/utils/siteOrigin";

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);
  const requestUrl = getRequestURL(event);
  const siteUrl = resolveSiteOrigin(config.public.siteUrl, requestUrl.origin);

  setHeader(event, "content-type", "text/plain; charset=utf-8");

  return `User-agent: *
Allow: /

Sitemap: ${new URL("/sitemap.xml", siteUrl).href}
`;
});
