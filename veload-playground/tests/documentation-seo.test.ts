// @vitest-environment node

import { readFileSync } from "node:fs";
import { IncomingMessage, ServerResponse } from "node:http";
import { Socket } from "node:net";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { createEvent } from "h3";
import { compileScript, compileTemplate, parse } from "vue/compiler-sfc";
import ts from "typescript";
import * as Veloader from "veload";
import { resolveSiteOrigin } from "../shared/utils/siteOrigin";
import { usePageSeo } from "../app/composables/usePageSeo";
import {
  exportedTypes,
  firstUse,
  globalRegistration,
  installationCommands,
  namedImports,
  nuxtSsrUse,
  nuxtStylesheet,
  viteStylesheet,
} from "../app/data/examples";
import robotsHandler from "../server/routes/robots.txt";
import sitemapHandler, { documentationRoutes } from "../server/routes/sitemap.xml";

const seo = vi.hoisted(() => ({
  config: { public: { siteUrl: "" as unknown } },
  runtimeConfig: vi.fn(),
  requestUrl: vi.fn(),
  head: vi.fn(),
  meta: vi.fn(),
}));

mockNuxtImport("useRuntimeConfig", () => seo.runtimeConfig);
mockNuxtImport("useRequestURL", () => seo.requestUrl);
mockNuxtImport("useHead", () => seo.head);
mockNuxtImport("useSeoMeta", () => seo.meta);

const requestOrigin = "http://127.0.0.1:4173";

beforeEach(() => {
  seo.config.public.siteUrl = "";
  seo.runtimeConfig.mockReturnValue(seo.config);
  seo.requestUrl.mockReturnValue(new URL(requestOrigin));
  // Nitro auto-imports are globals when these handlers run directly in Vitest.
  vi.stubGlobal("useRuntimeConfig", seo.runtimeConfig);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

function seoEvent(path: string) {
  const request = new IncomingMessage(new Socket());
  request.url = path;
  request.headers = {
    host: "127.0.0.1:4173",
    "x-forwarded-host": "untrusted.localhost",
  };
  return createEvent(request, new ServerResponse(request));
}

describe("shared SEO origin validation", () => {
  it.each([
    [" https://PUBLIC.localhost:8443/docs/?from=old#top ", "https://public.localhost:8443"],
    ["https://public.localhost/", "https://public.localhost"],
    ["http://localhost:3000/", "http://localhost:3000"],
    ["http://[::1]:3000/docs", "http://[::1]:3000"],
  ])("normalizes %s without changing supported HTTP(S) origins", (configured, expected) => {
    expect(resolveSiteOrigin(configured, requestOrigin)).toBe(expected);
  });

  it.each([
    undefined,
    null,
    42,
    {},
    "",
    "   ",
    "/docs",
    "not-an-origin",
    "//public.localhost",
    "ftp://public.localhost",
    "javascript:alert(1)",
    "https://user:secret@public.localhost",
  ])("uses the local request origin for invalid configuration: %j", (configured) => {
    expect(resolveSiteOrigin(configured, requestOrigin)).toBe(requestOrigin);
  });

  it("does not require a valid request URL when the public origin is configured", () => {
    expect(resolveSiteOrigin("https://public.localhost", "not-a-url")).toBe(
      "https://public.localhost",
    );
  });

  it("validates the fallback too and never invents a production domain", () => {
    expect(resolveSiteOrigin("", " HTTP://LOCALHOST:3001/a?b#c ")).toBe(
      "http://localhost:3001",
    );
    for (const fallback of [undefined, "not-a-url", "file:///tmp", "https://user:secret@localhost"]) {
      expect(resolveSiteOrigin("invalid", fallback)).toBe("http://localhost:3000");
    }
  });
});

describe("canonical, social, sitemap and robots agreement", () => {
  it.each([
    [" https://PUBLIC.localhost:8443/docs/?from=old#top ", "https://public.localhost:8443"],
    ["", requestOrigin],
    ["   ", requestOrigin],
    ["not-an-origin", requestOrigin],
    ["ftp://public.localhost", requestOrigin],
    ["https://user:secret@public.localhost", requestOrigin],
    [null, requestOrigin],
  ])("uses the same origin everywhere for %j", async (configured, expected) => {
    seo.config.public.siteUrl = configured;
    const page = usePageSeo({
      title: "Installation",
      description: "Consumer setup after release",
      path: "/docs/installation",
    });

    expect(page).toEqual({
      canonical: `${expected}/docs/installation`,
      image: `${expected}/og-image.png`,
      siteUrl: expected,
    });
    expect(seo.head).toHaveBeenLastCalledWith({
      link: [{ rel: "canonical", href: page.canonical }],
    });
    expect(seo.meta).toHaveBeenLastCalledWith(expect.objectContaining({
      ogUrl: page.canonical,
      ogImage: page.image,
      twitterImage: page.image,
      twitterCard: "summary_large_image",
    }));

    const robotsEvent = seoEvent("/robots.txt");
    const robots = await robotsHandler(robotsEvent);
    expect(robots).toContain(`Sitemap: ${expected}/sitemap.xml`);
    expect(robotsEvent.node.res.getHeader("content-type")).toBe("text/plain; charset=utf-8");

    const sitemapEvent = seoEvent("/sitemap.xml");
    const sitemap = await sitemapHandler(sitemapEvent);
    const locations = Array.from(String(sitemap).matchAll(/<loc>([^<]+)<\/loc>/g), (match) => match[1]);
    expect(locations).toEqual(documentationRoutes().map((route) => `${expected}${route.path}`));
    expect(sitemapEvent.node.res.getHeader("content-type")).toBe("application/xml; charset=utf-8");
    expect(`${robots}${sitemap}`).not.toMatch(/untrusted\.localhost|user:secret|ftp:/);
  });

  it("resolves a custom social image against the configured public origin", () => {
    seo.config.public.siteUrl = "https://public.localhost";
    const page = usePageSeo({
      title: "Guide",
      description: "Guide description",
      path: "/docs/api",
      image: "/images/guide.png",
      type: "article",
    });
    expect(page.image).toBe("https://public.localhost/images/guide.png");
    expect(seo.meta).toHaveBeenLastCalledWith(expect.objectContaining({
      ogType: "article",
      ogImage: page.image,
      twitterImage: page.image,
    }));
  });
});

describe("honest consumer installation documentation", () => {
  it("documents public package installation and keeps repository commands out of the page", () => {
    const source = readFileSync(new URL("../app/pages/docs/installation.vue", import.meta.url), "utf8");
    const packageManifest = JSON.parse(
      readFileSync(new URL("../../pcakage/package.json", import.meta.url), "utf8"),
    ) as { name: string; version: string };
    for (const guidance of [
      "published MIT-licensed package", "^3.5.2", "not Vue 4", "veload@" + packageManifest.version,
      "Optional registration", "useAsyncData", "module scope", "hydration",
    ]) {
      expect(source).toContain(guidance);
    }
    expect(source).toContain(':tabs="installationCommands"');
    expect(source).toContain("https://www.npmjs.com/package/veload");
    expect(source).not.toMatch(/installFromTarball|installFromDirectory|npm pack|npm --prefix/);
    expect(installationCommands.map((tab) => tab.code)).toEqual([
      "npm install veload",
      "pnpm add veload",
      "yarn add veload",
    ]);
    const snippets = [firstUse, globalRegistration, namedImports, nuxtSsrUse, nuxtStylesheet, viteStylesheet, exportedTypes].join("\n");
    expect(snippets).not.toMatch(/npm pack|npm --prefix|npm install \.\.|\.tgz|example\.com|veloader\.dev/);

    const { descriptor, errors } = parse(source);
    expect(errors).toEqual([]);
    const script = compileScript(descriptor, { id: "installation" });
    expect(compileTemplate({
      source: descriptor.template!.content,
      filename: "installation.vue",
      id: "installation",
      compilerOptions: { bindingMetadata: script.bindings },
    }).errors).toEqual([]);
    const ids = Array.from(source.matchAll(/id="([^"]+)"/g), (match) => match[1]);
    for (const link of source.matchAll(/href="#([^"]+)"/g)) {
      expect(ids).toContain(link[1]);
    }
  });

  it("uses real named exports and a separate stylesheet, not a plugin", () => {
    const snippets = [firstUse, globalRegistration, namedImports, nuxtSsrUse];
    for (const code of snippets) {
      for (const match of code.matchAll(/import\s*\{([^}]+)\}\s*from\s*"veload"/g)) {
        for (const name of match[1]!.split(",").map((name) => name.trim()).filter(Boolean)) {
          expect(Veloader, name).toHaveProperty(name);
        }
      }
      expect(code).not.toContain("app.use(");
    }
    expect(firstUse).toContain('import "veload/style.css";');
    expect(viteStylesheet).toContain('import "veload/style.css";');
    expect(nuxtStylesheet).toContain('css: ["veload/style.css"]');
    expect(globalRegistration).toContain('app.component("VSpinner", VSpinner)');
    expect(firstUse).toContain("catch (error)");
    expect(nuxtSsrUse).toContain('await useFetch<string>("/api/message")');
  });

  it.each([["Example.vue", firstUse], ["pages/message.vue", nuxtSsrUse]])(
    "compiles the documented SFC %s",
    (filename, source) => {
      const { descriptor, errors } = parse(source, { filename });
      expect(errors).toEqual([]);
      const script = compileScript(descriptor, { id: filename });
      const template = compileTemplate({
        source: descriptor.template!.content,
        filename,
        id: filename,
        compilerOptions: { bindingMetadata: script.bindings },
      });
      expect(template.errors).toEqual([]);
    },
  );

  it("resolves the documented TypeScript types from the installed package", () => {
    const filename = fileURLToPath(new URL("../app/data/documentation-types.ts", import.meta.url)).replace(/\\/g, "/");
    const source = `${exportedTypes}
const variant: LoaderVariant = "spin";
const named: NamedLoaderProps = { size: 32, decorative: true };
const loading: VLoadingProps = { loading: false };
const progress: VProgressProps = { value: 42 };
const skeleton: VSkeletonProps = { variant: "rect" };
const spinner: VSpinnerProps = { label: "Loading", size: 32 };
declare const execute: UseLoadingReturn["execute"];
const result: Promise<number> = execute(async () => 42);
`;
    const options: ts.CompilerOptions = {
      noEmit: true,
      strict: true,
      skipLibCheck: true,
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      types: [],
    };
    const host = ts.createCompilerHost(options);
    const getSourceFile = host.getSourceFile.bind(host);
    host.getSourceFile = (path, languageVersion, onError, shouldCreateNewSourceFile) =>
      path.replace(/\\/g, "/") === filename
        ? ts.createSourceFile(path, source, languageVersion, true)
        : getSourceFile(path, languageVersion, onError, shouldCreateNewSourceFile);
    const program = ts.createProgram([filename], options, host);
    const diagnostics = ts.getPreEmitDiagnostics(program).map((diagnostic) =>
      ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
    );
    expect(diagnostics).toEqual([]);
  });

  it("documents current package installation and production URLs", () => {
    const manifest = JSON.parse(readFileSync(new URL("../../pcakage/package.json", import.meta.url), "utf8"));
    const readme = readFileSync(new URL("../../README.md", import.meta.url), "utf8");
    const nuxtConfig = readFileSync(new URL("../nuxt.config.ts", import.meta.url), "utf8");
    expect(readme).toContain(manifest.peerDependencies.vue);
    expect(manifest.name).toBe("veload");
    expect(readme).toContain("npm install veload");
    expect(readme).toContain('import "veload/style.css";');
    expect(readme).toContain("https://veload-playground.vercel.app");
    expect(manifest.homepage).toBe("https://veload-playground.vercel.app");
    expect(manifest.repository.url).toBe("git+https://github.com/Shehab-Mu/veload.git");
    expect(manifest.bugs.url).toBe("https://github.com/Shehab-Mu/veload/issues");
    expect(readme).toContain("https://github.com/Shehab-Mu/veload");
    expect(readme).toContain("https://github.com/Shehab-Mu/veload/blob/main/pcakage/LICENSE");
    expect(nuxtConfig).toContain('siteUrl: "https://veload-playground.vercel.app"');
    expect(manifest.exports["./style.css"]).toBe("./dist/style.css");
    expect(readme).not.toContain(".env.example");
    const homepage = readFileSync(new URL("../app/pages/index.vue", import.meta.url), "utf8");
    expect(homepage).toContain("installSnippet");
    expect(homepage).toContain("https://www.npmjs.com/package/veload");
    expect(homepage).toContain('to="/docs/installation"');
    expect(homepage).toContain("switches between all 36 treatments");
    expect(homepage).not.toContain("37 treatments");
    const apiPage = readFileSync(new URL("../app/pages/docs/api.vue", import.meta.url), "utf8");
    expect(apiPage).toContain("one of the 36 treatments");
    expect(apiPage).not.toContain("37 treatments");
    const floatingActions = readFileSync(new URL("../app/components/FloatingActions.vue", import.meta.url), "utf8");
    expect(floatingActions).toContain('href="https://github.com/Shehab-Mu/veload"');
    const appFooter = readFileSync(new URL("../app/components/AppFooter.vue", import.meta.url), "utf8");
    expect(appFooter).toContain('href="https://github.com/Shehab-Mu/veload"');
  });
});
