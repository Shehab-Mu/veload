// @vitest-environment node
import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { compileScript, compileTemplate, parse } from "vue/compiler-sfc";
import { findLoader, findSkeletonPreset, loaders, skeletonDetails } from "~/data/catalog";
import { skeletonPresetPropNames } from "~/data/component-props";
import { buildGenericLoaderPropDocs, buildLoaderPropDocs } from "~/data/prop-docs";
import { installSnippet, loaderComposition, loaderSfc, loaderTypes, skeletonComposition, skeletonSfc, skeletonTemplate, skeletonTypes, stylesheetSnippet, type LoaderControlState, type SkeletonControlState } from "~/utils/code";
import { loaderDefaults, skeletonDefaults } from "~/utils/defaults";

const loaderState: LoaderControlState = { size: 80, color: "#14b8a6", duration: 1750, label: 'Syncing "workspace"', count: 7, value: 42, decorative: true };
const skeletonState: SkeletonControlState = {
  rows: 2, columns: 6, animated: false, color: "#123456", highlightColor: "rgba(255, 255, 255, 0.5)",
  label: 'Loading "workspace"', avatarSize: 64, mediaHeight: "12rem", showMedia: false, showAvatar: false,
  showHeader: false, showChart: false, showStats: false, showSubmit: false, showRating: false, showPrice: false, showCta: false,
};

function compileSfc(source: string, filename: string): void {
  const { descriptor, errors } = parse(source, { filename });
  expect(errors, filename).toEqual([]);
  const script = compileScript(descriptor, { id: filename });
  expect(compileTemplate({ source: descriptor.template!.content, filename, id: filename, compilerOptions: { bindingMetadata: script.bindings } }).errors, filename).toEqual([]);
}

describe("generated examples honor the installed package contract", () => {
  it("compiles both SFC tabs for every loader and skeleton detail entry", () => {
    for (const entry of loaders) {
      compileSfc(loaderSfc(entry, loaderState, loaderDefaults(entry.defaultMarks)), `${entry.slug}.vue`);
      compileSfc(loaderComposition(entry, loaderState, loaderDefaults(entry.defaultMarks)), `${entry.slug}-composition.vue`);
    }
    for (const entry of skeletonDetails) {
      compileSfc(skeletonSfc(entry, skeletonState, skeletonDefaults()), `${entry.slug}.vue`);
      compileSfc(skeletonComposition(entry, skeletonState, skeletonDefaults()), `${entry.slug}-composition.vue`);
    }
  });

  it("typechecks every generated props example against real exported declarations", () => {
    const files = new Map<string, string>();
    for (const entry of loaders) {
      const filename = fileURLToPath(new URL(`../app/data/check-${entry.slug}.ts`, import.meta.url)).replace(/\\/g, "/");
      files.set(filename, loaderTypes(entry, loaderState));
    }
    for (const entry of skeletonDetails) {
      const filename = fileURLToPath(new URL(`../app/data/check-${entry.slug}.ts`, import.meta.url)).replace(/\\/g, "/");
      files.set(filename, skeletonTypes(entry, skeletonState, skeletonDefaults()));
    }
    const options: ts.CompilerOptions = { noEmit: true, strict: true, skipLibCheck: true, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, types: [] };
    const host = ts.createCompilerHost(options);
    const original = host.getSourceFile.bind(host);
    host.getSourceFile = (filename, version, onError, fresh) => {
      const source = files.get(filename.replace(/\\/g, "/"));
      return source === undefined ? original(filename, version, onError, fresh) : ts.createSourceFile(filename, source, version, true);
    };
    const program = ts.createProgram([...files.keys()], options, host);
    const diagnostics = ts.getPreEmitDiagnostics(program).map((item) => `${item.file?.fileName ?? ""}: ${ts.flattenDiagnosticMessageText(item.messageText, "\n")}`);
    expect(diagnostics).toEqual([]);
  });

  it("filters irrelevant controls out of every skeleton tab", () => {
    for (const entry of skeletonDetails) {
      const template = skeletonTemplate(entry, skeletonState, skeletonDefaults());
      const composition = skeletonComposition(entry, skeletonState, skeletonDefaults());
      const types = skeletonTypes(entry, skeletonState, skeletonDefaults());
      const allowed = skeletonPresetPropNames[entry.name] ?? [];
      for (const name of Object.keys(skeletonState)) {
        if (allowed.includes(name)) continue;
        expect(template, `${entry.name}.${name}`).not.toMatch(new RegExp(`[: ]${name}=`));
        expect(composition, `${entry.name}.${name}`).not.toContain(`const ${name} = ref(`);
        expect(types, `${entry.name}.${name}`).not.toContain(`  ${name}:`);
      }
    }
    const product = findSkeletonPreset("product-card-skeleton")!;
    expect(skeletonTypes(product, skeletonState, skeletonDefaults())).not.toContain("rows:");
  });

  it("omits ignored and default mark counts rather than suggesting false controls", () => {
    for (const slug of ["breathing", "dual-arc"]) {
      const entry = findLoader(slug)!;
      expect(loaderTypes(entry, loaderState)).not.toContain("count:");
      const docs = buildLoaderPropDocs({ defaultMarks: 2, repeatCount: false });
      expect(docs.find((prop) => prop.name === "count")?.description).toContain("ignored");
    }
    const heatmap = findLoader("heatmap")!;
    expect(loaderTypes(heatmap, { ...loaderState, count: 9 })).not.toContain("count:");
    const countDefault = buildGenericLoaderPropDocs().find((prop) => prop.name === "count")?.default;
    expect(countDefault).toContain("9 for heatmap/squares");
    expect(countDefault).not.toContain("9 for grid");
  });

  it("keeps every installation tab honest and free of contributor-only commands or encoding artifacts", () => {
    expect(installSnippet()).toBe("npm install veload");
    expect(installSnippet()).not.toMatch(/--prefix|npm pack|\.tgz|\.\.\/pcakage/);
    expect(stylesheetSnippet()).toContain("veload/style.css");
    expect(stylesheetSnippet()).not.toContain("Ã¢â‚¬");
  });
});
