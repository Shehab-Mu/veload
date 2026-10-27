import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import * as Veloader from "veload";
import {
  findLoader,
  getLoaderComponent,
  getSkeletonPresetComponent,
  loaders,
  skeletonPresets,
} from "~/data/catalog";
import { loaderVariants } from "#shared/data/loaders";
import { skeletonPatterns } from "#shared/data/skeletons";
import { buildLoaderPropDocs } from "~/data/prop-docs";
import { skeletonPresetPropNames } from "~/data/component-props";

describe("catalogue integrity", () => {
  it("documents all 36 named loaders exactly once", () => {
    expect(loaders).toHaveLength(36);
    expect(new Set(loaders.map((entry) => entry.name)).size).toBe(loaders.length);
    expect(new Set(loaders.map((entry) => entry.slug)).size).toBe(loaders.length);
    expect(new Set(loaders.map((entry) => entry.variant)).size).toBe(loaders.length);

    const exportedLoaders = Object.keys(Veloader).filter((name) =>
      name.endsWith("Loader") && name !== "VLoader" && name !== "VSkeletonLoader",
    );
    expect(loaders.map((entry) => entry.name).sort()).toEqual(exportedLoaders.sort());
  });

  it("only documents components that the package exports", () => {
    const exported = Veloader as unknown as Record<string, unknown>;

    for (const entry of loaders) {
      expect(exported[entry.name], `${entry.name} is exported`).toBeTruthy();
      expect(getLoaderComponent(entry.name)).toBe(exported[entry.name]);
    }

    for (const preset of skeletonPresets) {
      expect(exported[preset.name], `${preset.name} is exported`).toBeTruthy();
      expect(getSkeletonPresetComponent(preset.name)).toBe(exported[preset.name]);
    }
  });

  it("uses the same variants as the package", () => {
    expect(loaderVariants.slice().sort()).toEqual(
      loaders.map((entry) => entry.variant).sort(),
    );
    for (const variant of loaderVariants) {
      const wrapper = mount(Veloader.VLoader, { props: { variant } });
      expect(wrapper.classes(), `${variant} is a supported package variant`).toContain(`v-loader--${variant}`);
      wrapper.unmount();
    }
  });

  it("documents all ten named skeleton presets", () => {
    expect(skeletonPresets).toHaveLength(10);
    expect(new Set(skeletonPresets.map((entry) => entry.pattern)).size).toBe(10);
  });

  it("covers all eleven skeleton patterns", () => {
    expect(skeletonPatterns.map((entry) => entry.pattern)).toEqual([
      "lines",
      "article",
      "card",
      "profile",
      "list",
      "table",
      "media",
      "form",
      "dashboard",
      "feed",
      "product",
    ]);
  });

  it("resolves entries by slug", () => {
    expect(findLoader("spin")?.name).toBe("VSpinLoader");
    expect(findLoader("not-a-loader")).toBeUndefined();
  });

  it("matches the number of marks the package renders by default", () => {
    for (const entry of loaders) {
      const wrapper = mount(getLoaderComponent(entry.name));
      const marks = wrapper.findAll(".v-loader__mark").length;

      expect(marks, `${entry.name} renders ${entry.defaultMarks} marks`).toBe(
        entry.defaultMarks,
      );
    }
  });

  it("keeps the documented mark counts in sync with the rendered output", () => {
    for (const entry of loaders.filter((loader) => loader.repeatCount)) {
      const wrapper = mount(getLoaderComponent(entry.name), {
        props: { count: 2 },
      });

      expect(wrapper.findAll(".v-loader__mark")).toHaveLength(2);
    }
  });

  it.each(["bars", "bounce", "dots", "typing"])("describes the verified four-mark default for %s", (slug) => {
    const entry = findLoader(slug);
    expect(entry?.defaultMarks).toBe(4);
    expect(entry?.highlights[0]).toMatch(/^Four\b/);
    expect(entry?.highlights.join(" ")).not.toMatch(/\b(?:three|five)\b/i);
  });
});

describe("prop documentation", () => {
  it("documents only props that the component declares", () => {
    const documented = buildLoaderPropDocs({ defaultMarks: 4 });
    const runtimeProps = Object.keys(
      (Veloader.VLoader as unknown as { props: Record<string, unknown> }).props,
    );

    for (const prop of documented) {
      expect(runtimeProps).toContain(prop.name);
    }
  });

  it("documents the shared loader props for every named loader", () => {
    for (const entry of loaders) {
      const documented = buildLoaderPropDocs({
        defaultMarks: entry.defaultMarks,
        supportsValue: entry.supportsValue,
      });
      const names = documented.map((prop) => prop.name);

      expect(names).toContain("size");
      expect(names).toContain("color");
      expect(names).toContain("duration");
      expect(names).toContain("count");
      expect(names).toContain("label");
      expect(names).toContain("decorative");
      expect(names.includes("value")).toBe(entry.supportsValue);
    }
  });

  it("only documents props that each skeleton preset accepts", () => {
    for (const preset of skeletonPresets) {
      const names = skeletonPresetPropNames[preset.name];

      expect(names, `${preset.name} has props`).toBeTruthy();

      for (const name of names) {
        expect(name).not.toBe("pattern");
      }
    }
  });

  it("gives every documented prop a type and a description", () => {
    for (const entry of loaders) {
      for (const prop of buildLoaderPropDocs({
        defaultMarks: entry.defaultMarks,
        supportsValue: entry.supportsValue,
      })) {
        expect(prop.type).not.toBe("unknown");
        expect(prop.description.length).toBeGreaterThan(10);
      }
    }
  });
});
