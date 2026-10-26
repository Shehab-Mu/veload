# Veloader documentation

The documentation website and interactive playground for
[Veloader](../pcakage), a loading toolkit for Vue 3 with no runtime dependency
other than its Vue peer (`^3.5.2`).

The site is a [Nuxt 4](https://nuxt.com) application with server rendering.
It uses the library's named exports and `veload/style.css`, but its
installation is local: `package.json` points to `file:../pcakage`. The library
is licensed under MIT but has not yet been published to npm. The deployed
playground is a separate application, not evidence that an npm package release
is available. Consumer installation works only after the first release is
verified on the npm registry.

## Local contributor setup

Requirements: Node.js **22.22.3 or later within Node 22** and npm. The
playground's `engines.node` is `^22.22.3`, matching the Node 22 minimum of
locked Nuxt 4.6.2. Node 20 and earlier Node 22 patch releases do not satisfy
this toolchain. Run these commands from the repository root (`Veloader`),
which has no root package manifest:

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

The direct Vue Router dependency must stay compatible with Nuxt's router:
Nuxt 4.6.2 requires `^5.4.0`, including its `vue-router/volar/sfc-route-blocks`
export used by typechecking. A separate Router 4 installation at the app
root shadows that export even when Nuxt has a nested Router 5 installation.

## Vercel monorepo build

Keep the Vercel project's **Root Directory** set to `veloader-playground`.
The `vercel.json` in this directory selects the Nuxt framework and defines
the install and build commands; it does not change the root directory or
perform a deployment by itself.

The install command runs from `veloader-playground`, in this order:

```bash
npm --prefix ../pcakage ci --include=dev
npm --prefix ../pcakage run build
npm ci --include=dev
```

Both projects have independent lockfiles and dependency directories. The
`file:../pcakage` link does not install the library's own devDependencies,
and `npm --prefix ../pcakage run build` does not install anything. The
explicit library install supplies its declared Vite, Vue plugin, Vue,
TypeScript, and `vue-tsc` without depending on the playground's transitive
packages or globally available binaries. `--include=dev` is intentional:
these tools, and Nuxt itself, are build-time devDependencies even for a
production deployment.

The library build produces its public ESM/CommonJS exports, stylesheet, and
declarations before the playground installation runs `postinstall: nuxt
prepare`. This ordering also avoids relying on cached `dist` output, which
is not committed. Vercel then runs `npm run build`, preserving the existing
`prebuild` hook and rebuilding the library before Nuxt. This second library
build is intentional: ordinary local builds still use the same hook.

Verify these Vercel project settings before a later deployment:

- Enable **Include source files outside of the Root Directory in the Build
  Step**, so the sibling `pcakage` source and lockfile are available.
- Select Node **22.x** and confirm its actual patch version is **22.22.3 or
  newer**. The package engine range selects the supported major, but cannot
  make an older platform-provided Node patch compatible.
- Use the install/build commands in `vercel.json`; do not replace the build
  command with `nuxt build`, which would bypass npm's `prebuild` hook.
- Leave **Output Directory** at the Nuxt framework default. Do not override
  it to `dist`; Nitro's Vercel preset produces the Vercel build output.
- Do not enable an install option that omits devDependencies or changes the
  lockfile's local-package link into a different installation strategy.

To check the same pipeline locally without deploying, use a separate clean
checkout with the supported Node version and run from the repository root:

```bash
npm --prefix pcakage ci --include=dev
npm --prefix pcakage run build
npm --prefix veloader-playground ci --include=dev
npm --prefix veloader-playground run build
```

These are verification instructions, not commands executed automatically
outside the explicitly configured install/build lifecycle. No npm publishing
or Vercel deployment command is part of this setup.

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

## Dependency security

Run `npm audit --json` independently in `pcakage` and `veloader-playground`;
include development dependencies because they execute during builds and tests.
The current lockfile includes Happy DOM 21.0.4 and serialize-javascript 7.1.4,
which address GHSA-834v-8h66-3h79 and GHSA-m5mm-p8h7-m29v respectively.

An unresolved upstream advisory remains: **GHSA-86w9-cpqp-85rv** affects
`node-forge <=1.4.0`, reached through
`nuxt → @nuxt/nitro-server → nitropack → listhen → node-forge`.
The advisory describes acceptance of forged RSA PKCS#1 v1.5 signatures with
low-exponent keys. At review time, 1.4.0 is the latest published node-forge
and the advisory lists no patched release. npm reports seven high-severity
package findings from this single underlying advisory and its dependency
chain. This is not a clean security audit.

Do not apply npm's suggested Nuxt downgrade or an unverified override merely
to clear the report. Monitor the advisory and upstream releases, then update
and repeat clean installation, tests, typechecks and builds when a compatible
fix exists. Until then, treat this as a build-tool dependency risk: use trusted
build inputs and do not rely on the affected node-forge signature verifier.
`glob@10.5.0` also remains deprecated through Nitro's archiver dependency;
replacing it across a major boundary requires upstream compatibility review.

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
