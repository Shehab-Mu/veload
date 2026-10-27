import { describe, expect, it } from "vitest";
import { compileScript, compileTemplate, parse } from "vue/compiler-sfc";
import {
  loaderComposition,
  loaderSfc,
  loaderTemplate,
  loaderTypes,
  skeletonComposition,
  skeletonSfc,
  skeletonTemplate,
  skeletonTypes,
  type LoaderControlState,
  type SkeletonControlState,
} from "~/utils/code";
import { loaderDefaults, skeletonDefaults } from "~/utils/defaults";
import { findLoader, findSkeletonPreset } from "~/data/catalog";

const spin = findLoader("spin")!;
const ring = findLoader("progress-ring")!;
const card = findSkeletonPreset("card-skeleton")!;

function state(overrides: Partial<LoaderControlState> = {}): LoaderControlState {
  return {
    size: 48,
    color: "#6d3ff2",
    duration: 1200,
    label: "Loading content",
    count: 4,
    value: null,
    decorative: false,
    ...overrides,
  };
}

function skeletonState(
  overrides: Partial<SkeletonControlState> = {},
): SkeletonControlState {
  return {
    rows: 3,
    columns: 3,
    animated: true,
    color: "",
    highlightColor: "",
    label: "",
    avatarSize: 48,
    mediaHeight: "",
    showMedia: true,
    showAvatar: true,
    showHeader: true,
    showChart: true,
    showStats: true,
    showSubmit: true,
    showRating: true,
    showPrice: true,
    showCta: true,
    ...overrides,
  };
}

describe("script-safe string literals", () => {
  it.each([
    "Loading </script> content",
    'Loading </ScRiPt><script>unexpected()</script> & "quotes" \\ path\nnext',
    "Loading <!-- and <template> content",
  ])("compiles generated examples and preserves the label %j", (label) => {
    const currentLoader = state({ label });
    const currentSkeleton = skeletonState({ label });
    const composition = {
      loader: loaderComposition(spin, currentLoader, loaderDefaults(4)),
      skeleton: skeletonComposition(card, currentSkeleton, skeletonDefaults()),
    };
    const types = {
      loader: loaderTypes(spin, currentLoader),
      skeleton: skeletonTypes(card, currentSkeleton, skeletonDefaults()),
    };
    const sources = {
      ...composition,
      loaderSfc: loaderSfc(spin, currentLoader, loaderDefaults(4)),
      skeletonSfc: skeletonSfc(card, currentSkeleton, skeletonDefaults()),
      loaderTypes: `<script setup lang="ts">\n${types.loader}\n</script>\n<template><VSpinLoader v-bind="props" /></template>`,
      skeletonTypes: `<script setup lang="ts">\n${types.skeleton}\n</script>\n<template><VCardSkeleton v-bind="props" /></template>`,
    };

    for (const [name, source] of Object.entries(sources)) {
      const filename = `${name}.vue`;
      const { descriptor, errors } = parse(source, { filename });
      expect(errors, filename).toEqual([]);
      const script = compileScript(descriptor, { id: name });
      expect(compileTemplate({
        source: descriptor.template!.content,
        filename,
        id: name,
        compilerOptions: { bindingMetadata: script.bindings },
      }).errors, filename).toEqual([]);
    }

    for (const source of Object.values(composition)) {
      const literal = source.match(/const label = ref\((.*)\);/)?.[1];
      expect(literal).toBeDefined();
      expect(literal).not.toContain("<");
      expect(JSON.parse(literal!)).toBe(label);
    }
    for (const source of Object.values(types)) {
      const literal = source.match(/label: (.*),/)?.[1];
      expect(literal).toBeDefined();
      expect(literal).not.toContain("<");
      expect(JSON.parse(literal!)).toBe(label);
    }
  });
});

describe("loader code generation", () => {
  it("renders the component with the selected values", () => {
    const code = loaderTemplate(spin, state(), loaderDefaults(4));

    expect(code).toBe(
      '<VSpinLoader :size="48" color="#6d3ff2" :duration="1200" label="Loading content" />',
    );
  });

  it("omits props that still use the documented default", () => {
    const code = loaderTemplate(
      spin,
      state({ size: 40, color: "currentColor", duration: 1000, label: "Loading" }),
      loaderDefaults(4),
    );

    expect(code).toBe("<VSpinLoader />");
  });

  it("renders the determinate value only for the progress ring", () => {
    expect(
      loaderTemplate(ring, state({ value: 42 }), loaderDefaults(4)),
    ).toContain(':value="42"');

    expect(
      loaderTemplate(spin, state({ value: 42 }), loaderDefaults(4)),
    ).not.toContain("value");
  });

  it("renders the decorative flag as a boolean attribute", () => {
    expect(
      loaderTemplate(spin, state({ decorative: true }), loaderDefaults(4)),
    ).toContain("decorative");
  });

  it("preserves an empty label because it makes the preview decorative", () => {
    const current = state({ label: "" });

    expect(loaderTemplate(spin, current, loaderDefaults(4))).toContain('label=""');
    expect(loaderComposition(spin, current, loaderDefaults(4))).toContain(
      'const label = ref("");',
    );
    expect(loaderComposition(spin, current, loaderDefaults(4))).toContain(
      ':label="label"',
    );
  });

  it("omits the decorative flag while it is off", () => {
    expect(
      loaderTemplate(spin, state({ decorative: false }), loaderDefaults(4)),
    ).not.toContain("decorative");
  });

  it("escapes quotes in labels", () => {
    const code = loaderTemplate(
      spin,
      state({ label: 'Loading "projects"' }),
      loaderDefaults(4),
    );

    expect(code).toContain('label="Loading &quot;projects&quot;"');
  });

  it("builds a complete single file component", () => {
    const code = loaderSfc(spin, state(), loaderDefaults(4));

    expect(code.startsWith('<script setup lang="ts">')).toBe(true);
    expect(code).toContain('import { VSpinLoader } from "veload";');
    expect(code).toContain('import "veload/style.css";');
    expect(code).toContain("<template>");
    expect(code).toContain("<VSpinLoader");
  });

  it("builds a state driven example that matches the controls", () => {
    const code = loaderComposition(spin, state(), loaderDefaults(4));

    expect(code).toContain("const size = ref(48);");
    expect(code).toContain('const color = ref("#6d3ff2");');
    expect(code).toContain(":size=\"size\"");
    expect(code).toContain(":color=\"color\"");
  });

  it("builds a typed example that uses the exported prop types", () => {
    expect(loaderTypes(spin, state())).toContain("NamedLoaderProps");
    expect(loaderTypes(ring, state())).toContain("VProgressRingLoaderProps");
    expect(loaderTypes(spin, state())).toContain("size: 48");
    expect(loaderTypes(spin, state({ label: "" }))).toContain('label: ""');
  });
});

describe("skeleton code generation", () => {
  it("renders the preset with the selected values", () => {
    const code = skeletonTemplate(
      card,
      skeletonState({ rows: 5, showMedia: false }),
      skeletonDefaults(),
    );

    expect(code).toContain('<VCardSkeleton :rows="5"');
    expect(code).toContain(':showMedia="false"');
  });

  it("omits props that still use the documented default", () => {
    const code = skeletonTemplate(card, skeletonState(), skeletonDefaults());

    expect(code).toBe("<VCardSkeleton />");
  });

  it("renders a boolean that was turned off", () => {
    const code = skeletonTemplate(
      card,
      skeletonState({ animated: false, showAvatar: false }),
      skeletonDefaults(),
    );

    expect(code).toContain(':animated="false"');
    expect(code).toContain(':showAvatar="false"');
  });

  it("builds a complete single file component", () => {
    const code = skeletonSfc(card, skeletonState(), skeletonDefaults());

    expect(code).toContain('import { VCardSkeleton } from "veload";');
    expect(code).toContain("<VCardSkeleton");
  });

  it("builds a state driven example", () => {
    const code = skeletonComposition(
      card,
      skeletonState({ rows: 5 }),
      skeletonDefaults(),
    );

    expect(code).toContain("const rows = ref(5);");
  });
});
