import { afterEach, describe, expect, it, vi } from "vitest";
import { enableAutoUnmount, flushPromises } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { createSSRApp } from "vue";
import { renderToString } from "vue/server-renderer";
import {
  VBreathingLoader,
  VDotSweepLoader,
  VDualArcLoader,
  VLoader,
  VSlidingBarsLoader,
} from "veload";
import CodeBlock from "~/components/CodeBlock.vue";
import LoaderCard from "~/components/LoaderCard.vue";
import LoaderPlayground from "~/components/LoaderPlayground.vue";
import { findLoader, getLoaderComponent, loaders, type LoaderMeta } from "~/data/catalog";

enableAutoUnmount(afterEach);

const additions = [
  { slug: "breathing", name: "VBreathingLoader", component: VBreathingLoader, category: "Circular", defaultMarks: 2, repeatCount: false },
  { slug: "dual-arc", name: "VDualArcLoader", component: VDualArcLoader, category: "Circular", defaultMarks: 2, repeatCount: false },
  { slug: "dot-sweep", name: "VDotSweepLoader", component: VDotSweepLoader, category: "Motion", defaultMarks: 4, repeatCount: true },
  { slug: "sliding-bars", name: "VSlidingBarsLoader", component: VSlidingBarsLoader, category: "Motion", defaultMarks: 4, repeatCount: true },
] as const;

function requireLoader(slug: string): LoaderMeta {
  const entry = findLoader(slug);
  if (!entry) throw new Error(`Missing loader metadata: ${slug}`);
  return entry;
}

function restoreProperty(target: object, name: PropertyKey, descriptor: PropertyDescriptor | undefined): void {
  if (descriptor) Object.defineProperty(target, name, descriptor);
  else Reflect.deleteProperty(target, name);
}

describe.each(additions)("$name playground integration", ({ slug, name, component, category, defaultMarks, repeatCount }) => {
  it("resolves useful metadata to the real public export", () => {
    const entry = requireLoader(slug);
    expect(entry).toMatchObject({ slug, name, variant: slug, category, defaultMarks, repeatCount, supportsValue: false });
    expect(loaders.filter((loader) => loader.slug === slug)).toHaveLength(1);
    expect(entry.description.length).toBeGreaterThan(15);
    expect(entry.highlights).toHaveLength(3);
    expect(entry.highlights.every((highlight) => highlight.length > 20)).toBe(true);
    expect(getLoaderComponent(entry.name)).toBe(component);
  });

  it("renders a gallery card linking to its existing dynamic detail route", async () => {
    const entry = requireLoader(slug);
    const card = await mountSuspended(LoaderCard, { props: { entry }, route: "/loaders" });
    const link = card.get("a.loader-card");

    expect(link.attributes("href")).toBe(`/loaders/${slug}`);
    expect(findLoader(link.attributes("href")?.split("/").pop() ?? "")).toBe(entry);
    expect(card.get(".loader-card__title").text()).toBe(entry.title);
    expect(card.get(".loader-card__name").text()).toBe(name);
    expect(card.get(".loader-card__description").text()).toBe(entry.description);
    expect(card.get(".badge").text()).toBe(category);
    expect(card.findComponent(component).exists()).toBe(true);
    expect(card.get(".v-loader").classes()).toContain(`v-loader--${slug}`);
    expect(card.get(".v-loader").attributes("aria-hidden")).toBe("true");
    expect(card.get(".v-loader").attributes("role")).toBeUndefined();
    expect(card.findAll(".v-loader__mark")).toHaveLength(defaultMarks);
  });

  it("previews its real component with only applicable controls", async () => {
    const screen = await mountSuspended(LoaderPlayground, { props: { entry: requireLoader(slug) } });
    expect(screen.findComponent(component).exists()).toBe(true);
    expect(screen.getComponent(VLoader).props()).toMatchObject({
      variant: slug, size: 48, duration: 1200, color: "#6d3ff2", count: defaultMarks,
      label: "Loading content", decorative: false,
    });
    expect(screen.get(".v-loader").classes()).toContain(`v-loader--${slug}`);
    expect(screen.findAll(".v-loader__mark")).toHaveLength(defaultMarks);
    expect(screen.get(".v-loader").attributes("role")).toBe("status");
    expect(screen.get(".playground__label").text()).toBe("Loading content");
    expect(screen.get(".playground__label").attributes("aria-hidden")).toBe("true");
    expect(screen.find("#loader-count").exists()).toBe(repeatCount);
    expect(screen.find("#loader-determinate").exists()).toBe(false);
    expect(screen.find("#loader-value").exists()).toBe(false);
    expect(screen.get(".playground__controls").attributes("aria-busy")).toBeUndefined();
    expect(screen.findAll("input").every((input) => input.attributes("disabled") === undefined)).toBe(true);
    if (repeatCount) {
      const count = screen.get<HTMLInputElement>("#loader-count");
      expect(count.element.value).toBe(String(defaultMarks));
      expect(count.attributes()).toMatchObject({ min: "1", max: "12", step: "1" });
    }
  });

  it("server-renders the preview and examples before enabling its controls", async () => {
    const html = await renderToString(createSSRApp(LoaderPlayground, { entry: requireLoader(slug) }));
    expect(html).toContain(`v-loader--${slug}`);
    expect(html).toContain('aria-label="Loading content"');
    expect(html.match(/class="v-loader__mark"/g) ?? []).toHaveLength(defaultMarks);
    expect(html).toContain(name);
    expect(html.includes('id="loader-count"')).toBe(repeatCount);
    expect(html).not.toContain('id="loader-value"');
    const inputs = html.match(/<input[^>]*>/g) ?? [];
    expect(inputs.length).toBeGreaterThan(0);
    expect(inputs.every((input) => input.includes("disabled"))).toBe(true);
  });

  it("synchronizes controls, preview, every code tab, and the copied raw code", async () => {
    const screen = await mountSuspended(LoaderPlayground, { props: { entry: requireLoader(slug) } });
    const label = `Syncing ${slug} jobs`;
    await screen.get("#loader-size").setValue(80);
    await screen.get("#loader-duration").setValue(1750);
    await screen.get("#loader-color").setValue("#14b8a6");
    await screen.get("#loader-label").setValue(label);
    if (repeatCount) await screen.get("#loader-count").setValue(7);

    const preview = screen.get(".v-loader");
    expect(preview.attributes("style")).toContain("--vl-size: 80px");
    expect(preview.attributes("style")).toContain("--vl-duration: 1750ms");
    expect(preview.attributes("style")).toContain("--vl-color: #14b8a6");
    expect(preview.attributes("aria-label")).toBe(label);
    expect(screen.get(".playground__label").text()).toBe(label);
    expect(screen.findAll(".v-loader__mark")).toHaveLength(repeatCount ? 7 : 2);
    const template = screen.get(".playground__template code").text();
    expect(template).toContain(`<${name}`);
    expect(template).toContain(':size="80"');
    expect(template).toContain(':duration="1750"');
    expect(template).toContain('color="#14b8a6"');
    expect(template).toContain(`label="${label}"`);
    if (repeatCount) expect(template).toContain(':count="7"');
    else expect(template).not.toContain(":count=");

    const writeText = vi.fn<(value: string) => Promise<void>>().mockResolvedValue(undefined);
    const clipboard = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    const secure = Object.getOwnPropertyDescriptor(window, "isSecureContext");
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    Object.defineProperty(window, "isSecureContext", { configurable: true, value: true });
    try {
      for (const labelText of ["Vue", "Composition API", "TypeScript", "Install", "Stylesheet"]) {
        const tab = screen.findAll('[role="tab"]').find((candidate) => candidate.text() === labelText);
        if (!tab) throw new Error(`Missing ${labelText} tab for ${name}`);
        await tab.trigger("click");
        expect(tab.attributes("aria-selected")).toBe("true");
        expect(screen.findAll('[role="tab"][aria-selected="true"]')).toHaveLength(1);
        const panel = screen.get(`[role="tabpanel"][id="${tab.attributes("aria-controls")}"]`);
        expect(panel.attributes("aria-labelledby")).toBe(tab.attributes("id"));
        expect(panel.isVisible()).toBe(true);
        const code = panel.getComponent(CodeBlock).props("code");
        expect(panel.get("pre code").text()).toBe(code.trim());

        if (labelText === "Vue") {
          expect(code).toContain(`import { ${name} } from "veload"`);
          expect(code).toContain(template);
        } else if (labelText === "Composition API") {
          expect(code).toContain(`import { ${name} } from "veload"`);
          expect(code).toContain("const size = ref(80);");
          expect(code).toContain("const duration = ref(1750);");
          expect(code).toContain('const color = ref("#14b8a6");');
          expect(code).toContain(`const label = ref("${label}");`);
          expect(code).toContain(':label="label"');
          if (repeatCount) expect(code).toContain("const count = ref(7);");
          else expect(code).not.toContain("const count = ref(");
        } else if (labelText === "TypeScript") {
          expect(code).toContain(name);
          expect(code).toContain("size: 80");
          expect(code).toContain("duration: 1750");
          expect(code).toContain('color: "#14b8a6"');
          expect(code).toContain(`label: "${label}"`);
          if (repeatCount) expect(code).toContain("count: 7");
          expect(code).not.toContain("value:");
        } else if (labelText === "Install") {
          expect(code).toContain("npm");
          expect(code).toContain("veload");
        } else {
          expect(code).toContain("veload/style.css");
        }

        writeText.mockClear();
        await panel.get(".copy-button").trigger("click");
        await flushPromises();
        expect(writeText).toHaveBeenCalledExactlyOnceWith(code);
        expect(panel.get(".copy-button").text()).toBe("Copied");
        expect(panel.get(".code-block__status").text()).toBe("Copied to the clipboard");
      }
    } finally {
      screen.unmount();
      restoreProperty(navigator, "clipboard", clipboard);
      restoreProperty(window, "isSecureContext", secure);
    }
  });

  it("preserves decorative and blank-label behavior while keeping the examples synchronized", async () => {
    const screen = await mountSuspended(LoaderPlayground, { props: { entry: requireLoader(slug) } });
    await screen.get("#loader-decorative").setValue(true);
    expect(screen.get(".v-loader").attributes("aria-hidden")).toBe("true");
    expect(screen.get(".v-loader").attributes("role")).toBeUndefined();
    expect(screen.get(".playground__label").text()).toBe("Loading content");
    expect(screen.get(".playground__template code").text()).toContain("decorative");

    await screen.get("#loader-decorative").setValue(false);
    await screen.get("#loader-label").setValue("");
    expect(screen.get(".v-loader").attributes("aria-hidden")).toBe("true");
    expect(screen.get(".v-loader").attributes("aria-label")).toBeUndefined();
    expect(screen.find(".playground__label").exists()).toBe(false);
    expect(screen.get(".playground__template code").text()).toContain('label=""');
    expect(screen.findAll(".v-loader__mark")).toHaveLength(defaultMarks);
  });
});

describe.each(additions.filter((entry) => entry.repeatCount))("$name count controls", ({ slug }) => {
  it.each([1, 12])("keeps %i marks in step with its generated usage", async (count) => {
    const screen = await mountSuspended(LoaderPlayground, { props: { entry: requireLoader(slug) } });
    await screen.get("#loader-count").setValue(count);
    expect(screen.findAll(".v-loader__mark")).toHaveLength(count);
    expect(screen.get(".v-loader").attributes("style")).toContain(`--vl-total: ${count}`);
    expect(screen.get(".playground__template code").text()).toContain(`:count="${count}"`);
  });
});
