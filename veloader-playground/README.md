# Veloader documentation

The documentation website and interactive playground for
[Veloader](../pcakage), a loading toolkit for Vue 3 with no runtime dependency
other than its Vue peer (`^3.5.2`).

The site is a [Nuxt 4](https://nuxt.com) application with server rendering.
It uses the library's public named exports and `veloader/style.css`, but its
installation is local: `package.json` points to `file:../pcakage`. The library
is currently private, `UNLICENSED`, and not published to npm. The consumer
installation guide describes the public workflow **only after a release**;
it does not imply that `npm install veloader` works today.

## Local contributor setup

Requirements: Node.js 20.19+ or 22.12+ and npm. Run these commands from the
repository root (`Veloader`), which has no root package manifest:

```bash
npm --prefix pcakage install
npm --prefix pcakage run build
npm --prefix veloader-playground install
npm --prefix veloader-playground run dev
```

The `pcakage` spelling is the actual library directory name. Build it before
installing the site so the local dependency has its `dist` exports and types.
The site's `predev` and `prebuild` scripts rebuild the library automatically;
`generate`, `typecheck`, and `test` do not. This workflow is for authorized
repository development, not installation instructions for public consumers.
See the library README's development section for local tarball checks.

## Scripts

Run these from `veloader-playground`:

```bash
npm run dev          # rebuild the library, then start the development server
npm run build        # rebuild the library, then build the production server
npm run generate     # prerender to static files; build the library first
npm run preview      # run the production build locally
npm run typecheck    # check the app, server and shared TypeScript
npm test             # Vitest, including page, catalogue and docs/SEO tests
npm run check:a11y   # audit rendered pages for accessibility and SEO
npm run check:interactions # exercise controls, tabs and copy in a browser
```

The browser audits need a running site and Chrome. `check:a11y` visits the
routes and reports missing labels, unnamed links and buttons, broken heading
order, duplicate ids, missing landmarks and missing metadata.
`check:interactions` verifies that controls update the previews, generated
code, tabs and copy feedback. They supplement, rather than replace, a manual
accessibility and deployment review.

## Structure

| Path | Purpose |
| --- | --- |
| `app/pages` | The routes of the site. |
| `app/components` | Reusable interface components and playgrounds. |
| `app/data` | Prop documentation, code examples and the component catalogue. |
| `app/utils` | Code generation, syntax highlighting and runtime prop reading. |
| `app/composables/usePageSeo.ts` | Canonical, Open Graph and Twitter metadata. |
| `shared/data` | Catalogue metadata shared with the sitemap. |
| `shared/utils/siteOrigin.ts` | HTTP(S) origin validation shared by page metadata and server SEO routes. |
| `server/routes` | `sitemap.xml` and `robots.txt`. |
| `tests` | Catalogue, code generation, interaction, page and docs/SEO suites. |

## Routes

| Route | Content |
| --- | --- |
| `/` | Curated selection, interactive controls and the core components. |
| `/loaders` | All 36 loader treatments with search and category filters. |
| `/loaders/[name]` | Preview, controls, implementation tabs and props for one loader. |
| `/skeletons` | The primitive, eleven patterns, switching helpers and named presets. |
| `/skeletons/[name]` | Live preview, controls, implementation tabs and props for each named preset, plus `/skeletons/lines` for the generic text pattern. |
| `/docs/installation` | Release status, consumer setup, stylesheet, Vue, TypeScript and Nuxt SSR usage. |
| `/docs/accessibility` | Roles, live regions, decorative mode and reduced motion. |
| `/docs/api` | Prop, slot, type and CSS custom property reference. |

## How the documentation stays accurate

`app/utils/props.ts` reads the installed package's runtime prop declarations.
The tests check documented exports, default mark counts, generated snippets,
page rendering and shared SEO origin handling. Rebuild the local library
before testing changes to its public API so these checks use the current
package rather than stale build output.

## Complete production browser verification

After `npm run build`, run:

```bash
node scripts/verify-production.mjs
```

This finite runner starts and stops its own local production servers. It runs
the route/accessibility/SEO audit, existing interaction checks, and workspace
regressions sequentially, then repeats metadata checks with a test-only
configured origin. Chrome/Chromium must already be installed; `CHROME_PATH`
can select its executable. No dependency installation is performed.

Workspace checks cover skeleton data rows (1, 2, 12), all pattern/preset
links, the new loader controls, tab keyboard behavior, actual clipboard
contents, reduced motion, console/hydration errors, and light/dark layouts
at 1440, 1024, 768, and 390 pixels. Screenshots are written to a printed
temporary directory. These are custom automated checks, not a WCAG
conformance certification or a substitute for screen-reader testing.

For the dashboard, `rows` counts data rows; one fixed header, statistics,
and chart are separate. The gallery maps every pattern to an implemented
detail page, including the generic Lines page, without changing named
preset URLs.

## Assets

`scripts/generate-og-image.mjs` writes `public/og-image.png` using only the
Node standard library:

```bash
npm run check:og-image
```

`scripts/capture.mjs` captures a running page with a chosen colour scheme:

```bash
node scripts/capture.mjs http://localhost:3000/loaders shot.png dark
```

## Public origin and deployment

Set **`NUXT_PUBLIC_SITE_URL`** in the deployment environment to the site's
**real public origin**: scheme, hostname and optional port. Use the public
`https://` origin for an HTTPS deployment, with no credentials, path, query or
fragment. No production domain is assumed or supplied by this repository.

This single runtime value controls canonical links, Open Graph page and image
URLs, Twitter images, sitemap entries and the sitemap URL in `robots.txt`.
All use the same validation: surrounding whitespace and trailing slashes are
normalized, and a URL containing a path/query/fragment is reduced to its
origin for compatibility. Only absolute HTTP(S) URLs without credentials are
accepted. An empty or invalid value falls back to the validated request
origin, which is useful for localhost development and audits. If that origin
is invalid too, the last-resort fallback is `http://localhost:3000`. These
fallbacks are **not** a production configuration strategy.

For local development, no environment file is required. If an override is
needed, create an ignored `.env` in `veloader-playground` yourself and set
`NUXT_PUBLIC_SITE_URL` there; no template-copy step is required. The value is
public runtime configuration, not a place for secrets.

### Reverse proxies and static hosting

- Behind a reverse proxy, set `NUXT_PUBLIC_SITE_URL` to the external public
  origin even if Nitro listens on an internal HTTP host/port. Do not rely on
  `Host` or forwarded headers to choose the canonical deployment address.
  Configure trusted forwarding headers at the proxy separately.
- For the production Node server, provide the variable to the process running
  `node .output/server/index.mjs` and restart/redeploy after changing it. The
  built server does not automatically load the development `.env` file.
- For `npm run generate`, build the library first and set the variable **at
  generation time**. Static head tags cannot pick up a later environment
  change; regenerate the site when its public origin changes. A static host
  cannot execute `server/routes`: ensure `/sitemap.xml` and `/robots.txt` are
  also prerendered or supplied by the host, rather than deploying only page
  HTML. Check the final output instead of assuming those handlers will run.
- Before release, inspect a rendered page's canonical and social image URLs,
  `/sitemap.xml`, and `/robots.txt`. They should all use the configured public
  origin, never an upstream hostname or localhost. A missing/invalid variable
  deliberately does not crash local work, so deployment checks must catch it.

`robots.txt` allows crawling; it is not access control for a private or staging
site. Protect non-public deployments separately.
