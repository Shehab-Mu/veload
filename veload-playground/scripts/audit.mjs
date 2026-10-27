/**
 * Accessibility and route-specific SEO audit of the rendered documentation.
 *
 * Run with `node scripts/audit.mjs http://127.0.0.1:3111`.
 * Routes come from the local sitemap, not TypeScript catalogue imports.
 * These are custom DOM/SEO checks, not axe or a screen-reader audit.
 */

import { withPage } from "./browser.mjs";

const baseUrl = process.argv[2] ?? "http://localhost:3000";
const staticRoutes = ["/", "/loaders", "/skeletons", "/docs/installation", "/docs/accessibility", "/docs/api"];

async function localResponse(path) {
  const target = new URL(path, baseUrl);
  if (target.origin !== new URL(baseUrl).origin) throw new Error(`Refusing cross-origin audit fetch: ${target.origin}`);
  const response = await fetch(target, {
    signal: AbortSignal.timeout(10000), redirect: "error",
  });
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  return response;
}

async function discoverRoutes() {
  const sitemapResponse = await localResponse("/sitemap.xml");
  if (!(sitemapResponse.headers.get("content-type") ?? "").includes("xml")) {
    throw new Error("/sitemap.xml was not served as XML");
  }
  const xml = await sitemapResponse.text();
  const decode = (value) => value.replace(/&(amp|lt|gt|quot|apos);/g, (_, name) => ({
    amp: "&", lt: "<", gt: ">", quot: '"', apos: "'",
  })[name]);
  const locations = Array.from(xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g), (match) => new URL(decode(match[1])));
  const routes = locations.map((location) => {
    if (location.origin !== expectedOrigin || location.username || location.password || location.search || location.hash) {
      throw new Error(`Sitemap URL has an incorrect origin, credentials, query or fragment: ${location.pathname}`);
    }
    return location.pathname;
  });
  if (new Set(routes).size !== routes.length) throw new Error("Sitemap contains duplicate routes");
  const counts = [staticRoutes.filter((route) => routes.includes(route)).length,
    routes.filter((route) => route.startsWith("/loaders/")).length,
    routes.filter((route) => route.startsWith("/skeletons/")).length];
  if (routes.length !== 53 || counts.join() !== "6,36,11") {
    throw new Error(`Expected 53 sitemap routes (6 static + 36 loaders + 11 skeletons); got ${routes.length} (${counts.join(" + ")})`);
  }
  for (const route of ["/loaders/spin", "/loaders/progress-ring", "/skeletons/card-skeleton", "/skeletons/lines",
    ...["breathing", "dual-arc", "dot-sweep", "sliding-bars"].map((slug) => `/loaders/${slug}`)]) {
    if (!routes.includes(route)) throw new Error(`Sitemap is missing ${route}`);
  }
  const robotsResponse = await localResponse("/robots.txt");
  if (!(robotsResponse.headers.get("content-type") ?? "").startsWith("text/plain")) throw new Error("robots.txt is not text/plain");
  const robots = await robotsResponse.text();
  const references = Array.from(robots.matchAll(/^Sitemap:\s*(\S+)\s*$/gm), (match) => match[1]);
  if (references.length !== 1 || references[0] !== new URL("/sitemap.xml", expectedOrigin).href) {
    throw new Error("robots.txt must reference exactly the configured/request-origin sitemap");
  }
  console.log(`PASS  sitemap and robots: ${routes.length} routes; origin ${expectedOrigin}`);
  // Fetch only local paths, never the public-origin fixture in <loc> values.
  return routes;
}

const configuredSiteUrl = process.env.NUXT_PUBLIC_SITE_URL?.trim() ?? "";
let expectedOrigin = new URL(baseUrl).origin;
let siteUrlWarning = "";

if (configuredSiteUrl) {
  try {
    const configuredUrl = new URL(configuredSiteUrl);

    if (
      (configuredUrl.protocol === "https:" || configuredUrl.protocol === "http:") &&
      !configuredUrl.username &&
      !configuredUrl.password
    ) {
      expectedOrigin = configuredUrl.origin;
    } else {
      siteUrlWarning =
        "NUXT_PUBLIC_SITE_URL must use http or https; this run expects the request origin.";
    }
  } catch {
    siteUrlWarning =
      "NUXT_PUBLIC_SITE_URL is not an absolute URL; this run expects the request origin.";
  }
} else {
  siteUrlWarning =
    "NUXT_PUBLIC_SITE_URL is unset; this run verifies request-origin fallback. Set it to the public canonical origin in production.";
}

const inspectPage = (route, expectedSiteOrigin) => {
  const problems = [];
  const add = (message) => problems.push(message);
  const document_ = document;

  const content = (selector, attribute = "content") =>
    document_.querySelector(selector)?.getAttribute(attribute)?.trim() ?? "";

  const absoluteHttpUrl = (value) => {
    try {
      const url = new URL(value);
      return (url.protocol === "http:" || url.protocol === "https:") &&
        !url.username &&
        !url.password
        ? url
        : null;
    } catch {
      return null;
    }
  };

  // Headings and landmarks.
  const headings = Array.from(document_.querySelectorAll("h1, h2, h3, h4, h5, h6"));
  const h1Count = headings.filter((heading) => heading.tagName === "H1").length;

  if (h1Count !== 1) add(`expected one h1, found ${h1Count}`);

  let previousLevel = 0;
  for (const heading of headings) {
    const level = Number(heading.tagName.slice(1));
    if (previousLevel && level > previousLevel + 1) {
      add(`heading order jumps from h${previousLevel} to h${level}`);
    }
    previousLevel = level;
  }

  for (const selector of ["header", "main", "footer", "nav"]) {
    if (!document_.querySelector(selector)) add(`missing <${selector}> landmark`);
  }

  // Accessible names.
  for (const control of document_.querySelectorAll("input, select, textarea")) {
    const id = control.getAttribute("id");
    const hasLabel =
      (id && document_.querySelector(`label[for="${CSS.escape(id)}"]`)) ||
      control.getAttribute("aria-label") ||
      control.getAttribute("aria-labelledby") ||
      control.closest("label");
    if (!hasLabel) add("form control has no accessible label");
  }

  for (const link of document_.querySelectorAll("a[href]")) {
    if (!(link.textContent ?? "").trim() && !link.getAttribute("aria-label")) {
      add("link has no accessible name");
    }
  }

  for (const button of document_.querySelectorAll("button")) {
    if (!(button.textContent ?? "").trim() && !button.getAttribute("aria-label")) {
      add("button has no accessible name");
    }
  }

  for (const image of document_.querySelectorAll("img")) {
    if (!image.hasAttribute("alt")) add("image has no alt attribute");
  }

  const ids = Array.from(document_.querySelectorAll("[id]"), (element) =>
    element.getAttribute("id"),
  );
  if (new Set(ids).size !== ids.length) add("duplicate element ids found");

  for (const tab of document_.querySelectorAll('[role="tab"]')) {
    const panelId = tab.getAttribute("aria-controls");
    if (!tab.hasAttribute("aria-selected")) add("tab is missing aria-selected");
    if (!panelId || !document_.getElementById(panelId)) {
      add("tab has a missing aria-controls target");
    }
  }

  for (const panel of document_.querySelectorAll('[role="tabpanel"]')) {
    const tabId = panel.getAttribute("aria-labelledby");
    if (!tabId || !document_.getElementById(tabId)) {
      add("tabpanel has a missing aria-labelledby target");
    }
  }

  // Route-specific metadata, including valid absolute URLs and consistency.
  const title = document_.title.trim();
  const description = content('meta[name="description"]');
  const canonicals = document_.querySelectorAll('link[rel="canonical"]');
  const canonicalValue = canonicals[0]?.getAttribute("href")?.trim() ?? "";
  const canonical = absoluteHttpUrl(canonicalValue);
  const expectedCanonical = new URL(route, `${expectedSiteOrigin}/`).href;

  if (!title) add("document title is empty");
  if (!description) add("meta description is empty");
  if (canonicals.length !== 1) add(`expected one canonical link, found ${canonicals.length}`);
  if (!canonical) add("canonical URL is not an absolute HTTP(S) URL");
  else {
    if (canonical.origin !== expectedSiteOrigin) {
      add("canonical URL does not use the configured/request site origin");
    }
    if (canonical.href !== expectedCanonical) {
      add(`canonical path does not match ${route}`);
    }
    if (canonical.search || canonical.hash) {
      add("canonical URL must not contain a query or fragment");
    }
  }

  const ogTitle = content('meta[property="og:title"]');
  const ogDescription = content('meta[property="og:description"]');
  const ogType = content('meta[property="og:type"]');
  const ogSiteName = content('meta[property="og:site_name"]');
  const ogUrlValue = content('meta[property="og:url"]');
  const ogImageValue = content('meta[property="og:image"]');
  const ogImageAlt = content('meta[property="og:image:alt"]');
  const twitterCard = content('meta[name="twitter:card"]');
  const twitterTitle = content('meta[name="twitter:title"]');
  const twitterDescription = content('meta[name="twitter:description"]');
  const twitterImageValue = content('meta[name="twitter:image"]');
  const ogUrl = absoluteHttpUrl(ogUrlValue);
  const ogImage = absoluteHttpUrl(ogImageValue);
  const twitterImage = absoluteHttpUrl(twitterImageValue);

  if (!ogTitle) add("og:title is empty");
  if (!ogDescription) add("og:description is empty");
  if (ogType !== "website" && ogType !== "article") add("og:type is invalid");
  if (ogSiteName !== "Veload") add("og:site_name is missing or incorrect");
  if (!ogUrl) add("og:url is not an absolute HTTP(S) URL");
  else if (ogUrl.href !== canonicalValue) add("og:url does not match canonical URL");
  if (!ogImage) add("og:image is not an absolute HTTP(S) URL");
  if (!ogImageAlt) add("og:image:alt is empty");
  if (twitterCard !== "summary_large_image") add("twitter:card is missing or invalid");
  if (!twitterTitle) add("twitter:title is empty");
  if (!twitterDescription) add("twitter:description is empty");
  if (!twitterImage) add("twitter:image is not an absolute HTTP(S) URL");

  for (const [name, url] of [["og:image", ogImage], ["twitter:image", twitterImage]]) {
    if (url && url.origin !== expectedSiteOrigin) {
      add(`${name} does not use the configured/request site origin`);
    }
  }

  if (ogImage && twitterImage && ogImage.href !== twitterImage.href) {
    add("Open Graph and Twitter image URLs differ");
  }
  if (ogTitle && twitterTitle && ogTitle !== twitterTitle) {
    add("Open Graph and Twitter titles differ");
  }
  if (description && (ogDescription !== description || twitterDescription !== description)) {
    add("description, Open Graph description, and Twitter description differ");
  }

  const imageUrl = ogImage?.href ?? "";
  const siteOrigin = expectedSiteOrigin;

  return {
    problems,
    title: title.slice(0, 180),
    description: description.slice(0, 180),
    canonical: canonicalValue.slice(0, 240),
    ogUrl: ogUrlValue.slice(0, 240),
    imageUrl: imageUrl.slice(0, 240),
    siteOrigin,
    headingCount: headings.length,
  };
};

let failedRoutes = 0;
if (siteUrlWarning) console.log(`CONFIGURATION: ${siteUrlWarning}`);

try {
  const routes = await discoverRoutes();
  const images = new Map();
  let diagnosticCursor = 0;
  let diagnostics = [];
  await withPage(baseUrl, () => null, {
    delay: 0, timeoutMs: 170000, failOnDiagnostics: false,
    onDiagnostics: (entries) => { diagnostics = entries; },
    actions: async (page) => {
      for (const route of routes) {
        try {
          await page.navigate(new URL(route, baseUrl).href);
          const result = await page.evaluate(`(${inspectPage.toString()})(${JSON.stringify(route)}, ${JSON.stringify(expectedOrigin)})`);
          if (result.imageUrl) {
            const imagePath = new URL(result.imageUrl).pathname;
            if (!images.has(imagePath)) {
              try {
                const response = await localResponse(imagePath);
                images.set(imagePath, (response.headers.get("content-type") ?? "").startsWith("image/"));
                await response.body?.cancel();
              } catch { images.set(imagePath, false); }
            }
            if (!images.get(imagePath)) result.problems.push("social image does not resolve to a local image asset");
          }
          for (const entry of page.diagnostics.slice(diagnosticCursor)) {
            result.problems.push(`${entry.kind}/${entry.level}: ${entry.message}`);
          }
          diagnosticCursor = page.diagnostics.length;
          if (result.problems.length) failedRoutes += 1;
          console.log(`${result.problems.length ? "FAIL" : "PASS"}  ${route}`);
          console.log(`      title: ${result.title || "(empty)"}`);
          console.log(`      canonical: ${result.canonical || "(missing)"}`);
          console.log(`      og:url: ${result.ogUrl || "(missing)"}`);
          console.log(`      social image: ${result.imageUrl || "(missing)"}`);
          for (const problem of result.problems) console.log(`      - ${problem}`);
        } catch (error) {
          failedRoutes += 1;
          console.log(`FAIL  ${route}: ${String(error.message).slice(0, 1000)}`);
        }
      }
    },
  });
  for (const entry of diagnostics.slice(diagnosticCursor)) {
    failedRoutes += 1;
    console.log(`FAIL  late browser diagnostic: ${JSON.stringify(entry)}`);
  }
  console.log(failedRoutes === 0
    ? `All ${routes.length} routes passed custom accessibility/SEO checks (not axe or a screen-reader audit).`
    : `${failedRoutes} route/browser failures across ${routes.length} audited routes.`);
  if (failedRoutes) process.exitCode = 1;
} catch (error) {
  console.error(`FAIL  audit: ${String(error.message).slice(0, 1200)}`);
  process.exitCode = 1;
}
