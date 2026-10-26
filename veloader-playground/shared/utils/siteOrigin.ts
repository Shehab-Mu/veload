const localOrigin = "http://localhost:3000";

function normalizeOrigin(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;

  try {
    const url = new URL(value.trim());
    if (
      (url.protocol === "https:" || url.protocol === "http:") &&
      !url.username &&
      !url.password
    ) {
      return url.origin;
    }
  } catch {
    // Invalid deployment values must not break metadata or the SEO routes.
  }

  return undefined;
}

/**
 * Share the same credential-free HTTP(S) origin across head tags and SEO routes.
 * Preserve request-origin fallback for local work; deployments must explicitly
 * set NUXT_PUBLIC_SITE_URL rather than trusting incoming proxy/host headers.
 */
export function resolveSiteOrigin(
  configured: unknown,
  requestOrigin: unknown,
): string {
  return normalizeOrigin(configured) ?? normalizeOrigin(requestOrigin) ?? localOrigin;
}
