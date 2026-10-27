/// <reference types="vite/client" />
import { mount } from "@vue/test-utils";
import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { createSSRApp, defineComponent, h } from "vue";
import { compileStyle, parse } from "vue/compiler-sfc";
import { renderToString } from "vue/server-renderer";
import {
  VBreathingLoader,
  VDotSweepLoader,
  VDualArcLoader,
  VLoader,
  VSlidingBarsLoader,
  type LoaderVariant,
  type NamedLoaderProps,
  type VLoaderProps,
} from "../index";
import { loaderVariants } from "../components/VLoader/types";
import loaderSource from "../components/VLoader/index.vue?raw";

const loaders = [
  { name: "VBreathingLoader", variant: "breathing", component: VBreathingLoader, repeated: false },
  { name: "VDualArcLoader", variant: "dual-arc", component: VDualArcLoader, repeated: false },
  { name: "VDotSweepLoader", variant: "dot-sweep", component: VDotSweepLoader, repeated: true },
  { name: "VSlidingBarsLoader", variant: "sliding-bars", component: VSlidingBarsLoader, repeated: true },
] as const;

const countCases = [
  { name: "omitted", count: undefined, expected: 4 },
  { name: "one", count: 1, expected: 1 },
  { name: "zero", count: 0, expected: 1 },
  { name: "negative", count: -8, expected: 1 },
  { name: "fractional", count: 2.5, expected: 3 },
  { name: "near maximum", count: 11.6, expected: 12 },
  { name: "maximum", count: 12, expected: 12 },
  { name: "oversized", count: 1000, expected: 12 },
  { name: "NaN", count: Number.NaN, expected: 4 },
  { name: "infinite", count: Number.POSITIVE_INFINITY, expected: 4 },
  { name: "negative infinity", count: Number.NEGATIVE_INFINITY, expected: 4 },
];

const accessibilityCases: Array<{ name: string; props: NamedLoaderProps; label: string | undefined }> = [
  { name: "default label", props: {}, label: "Loading" },
  { name: "trimmed label", props: { label: "  Syncing workspace  " }, label: "Syncing workspace" },
  { name: "decorative", props: { label: "Syncing", decorative: true }, label: undefined },
  { name: "empty label", props: { label: "" }, label: undefined },
  { name: "blank label", props: { label: " \n\t " }, label: undefined },
];

describe.each(loaders)("$name", ({ name, variant, component, repeated }) => {
  it("renders the same treatment through its named and generic exports", () => {
    const named = mount(component);
    const generic = mount(VLoader, { props: { variant } });

    expect(named.html()).toBe(generic.html());
    expect(named.classes()).toContain(`v-loader--${variant}`);
    expect(named.findAll(".v-loader")).toHaveLength(1);
    expect(named.findAll(".v-loader__visual")).toHaveLength(1);
    expect(named.findAll(".v-loader__mark")).toHaveLength(repeated ? 4 : 2);
    expect(named.get(".v-loader__visual").attributes("aria-hidden")).toBe("true");
    expect(named.find("svg").exists()).toBe(false);
    expect(named.attributes("style")).toContain("--vl-size: 40px");
    expect(named.attributes("style")).toContain("--vl-color: currentColor");
    expect(named.attributes("style")).toContain("--vl-duration: 1000ms");
  });

  it.each(accessibilityCases)("preserves status semantics for $name", ({ props, label }) => {
    const wrapper = mount(component, { props });

    expect(wrapper.attributes("role")).toBe(label ? "status" : undefined);
    expect(wrapper.attributes("aria-label")).toBe(label);
    expect(wrapper.attributes("aria-hidden")).toBe(label ? undefined : "true");
    expect(wrapper.findAll('[role="status"]')).toHaveLength(label ? 1 : 0);
    expect(wrapper.get(".v-loader__visual").attributes("aria-hidden")).toBe("true");
    expect(wrapper.findAll(".v-loader__mark[role], .v-loader__mark[aria-label]")).toHaveLength(0);
  });

  it("forwards props, classes, styles, attributes, and a single event listener", async () => {
    const onClick = vi.fn();
    const props: NamedLoaderProps = {
      size: 48, color: "  #7c3aed  ", duration: 750, count: 6,
      label: "Preparing workspace", decorative: false,
    };
    const wrapper = mount(component, {
      props,
      attrs: {
        id: `${variant}-indicator`, class: "consumer-loader", title: "Please wait",
        style: { marginInlineStart: "8px", "--consumer-accent": "teal" },
        "data-request": "workspace", "aria-describedby": "request-detail", onClick,
      },
    });

    expect(wrapper.attributes("id")).toBe(`${variant}-indicator`);
    expect(wrapper.classes()).toContain("consumer-loader");
    expect(wrapper.attributes("title")).toBe("Please wait");
    expect(wrapper.attributes("data-request")).toBe("workspace");
    expect(wrapper.attributes("aria-describedby")).toBe("request-detail");
    expect(wrapper.attributes("aria-label")).toBe("Preparing workspace");
    expect(wrapper.attributes("style")).toContain("--vl-size: 48px");
    expect(wrapper.attributes("style")).toContain("--vl-duration: 750ms");
    expect(wrapper.attributes("style")).toContain("--vl-color: #7c3aed");
    expect(wrapper.attributes("style")).toContain("margin-inline-start: 8px");
    expect(wrapper.attributes("style")).toContain("--consumer-accent: teal");
    for (const prop of ["variant", "color", "size", "duration", "count", "label", "decorative"]) {
      expect(wrapper.attributes(prop)).toBeUndefined();
    }
    await wrapper.trigger("click");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("keeps its named treatment even if an untyped variant attribute is supplied", () => {
    const wrapper = mount(component, { attrs: { variant: "wave" } });
    expect(wrapper.classes()).toContain(`v-loader--${variant}`);
    expect(wrapper.classes()).not.toContain("v-loader--wave");
    expect(wrapper.attributes("variant")).toBeUndefined();
  });

  it("supports a bare decorative attribute in a Vue template", () => {
    const Parent = defineComponent({
      components: { [name]: component },
      template: `<${name} decorative />`,
    });
    const wrapper = mount(Parent).get(".v-loader");
    expect(wrapper.attributes("aria-hidden")).toBe("true");
    expect(wrapper.attributes("role")).toBeUndefined();
  });

  it("reacts to changed props without adding duplicate status regions", async () => {
    const wrapper = mount(component, { props: { count: 2 } });
    await wrapper.setProps({ size: 64, color: "teal", duration: 1800, count: 7, label: "Refreshing" });

    expect(wrapper.attributes("style")).toContain("--vl-size: 64px");
    expect(wrapper.attributes("style")).toContain("--vl-color: teal");
    expect(wrapper.attributes("style")).toContain("--vl-duration: 1800ms");
    expect(wrapper.findAll(".v-loader__mark")).toHaveLength(repeated ? 7 : 2);
    expect(wrapper.findAll('[role="status"]')).toHaveLength(1);
    expect(wrapper.attributes("aria-label")).toBe("Refreshing");

    await wrapper.setProps({ decorative: true });
    expect(wrapper.attributes("aria-hidden")).toBe("true");
    expect(wrapper.attributes("role")).toBeUndefined();
    await wrapper.setProps({ decorative: false, label: " " });
    expect(wrapper.attributes("aria-hidden")).toBe("true");
    await wrapper.setProps({ label: "Ready soon" });
    expect(wrapper.attributes("role")).toBe("status");
    expect(wrapper.attributes("aria-label")).toBe("Ready soon");
    expect(wrapper.attributes("aria-hidden")).toBeUndefined();
  });

  it.each(countCases)("handles $name count without changing its geometry contract", ({ count, expected }) => {
    const marks = repeated ? expected : 2;
    for (const wrapper of [mount(component, { props: { count } }), mount(VLoader, { props: { variant, count } })]) {
      expect(wrapper.findAll(".v-loader__mark")).toHaveLength(marks);
      expect(wrapper.attributes("style")).toContain(`--vl-total: ${marks}`);
      wrapper.findAll(".v-loader__mark").forEach((mark, index) => {
        expect(mark.attributes("style")).toBe(`--vl-index: ${index};`);
      });
    }
  });

  it.each([
    { size: -10, duration: 0, expectedSize: 12, expectedDuration: 100 },
    { size: 12.5, duration: 100.5, expectedSize: 12.5, expectedDuration: 100.5 },
    { size: Number.NaN, duration: Number.POSITIVE_INFINITY, expectedSize: 40, expectedDuration: 1000 },
    { size: Number.NEGATIVE_INFINITY, duration: Number.NaN, expectedSize: 40, expectedDuration: 1000 },
  ])("normalizes size $size and duration $duration", ({ size, duration, expectedSize, expectedDuration }) => {
    const wrapper = mount(component, { props: { size, duration, color: " " } });
    expect(wrapper.attributes("style")).toContain(`--vl-size: ${expectedSize}px`);
    expect(wrapper.attributes("style")).toContain(`--vl-duration: ${expectedDuration}ms`);
    expect(wrapper.attributes("style")).toContain("--vl-color: currentColor");
    expect(wrapper.attributes("style")).not.toMatch(/NaN|Infinity/);
  });

  it("hydrates its server markup without mismatches", async () => {
    const props = { count: 12, size: 24, duration: 900, label: "Restoring session", "data-request": variant };
    const app = createSSRApp({ render: () => h(component, props) });
    const container = document.createElement("div");
    container.innerHTML = await renderToString(app);
    document.body.appendChild(container);
    const serverRoot = container.firstElementChild;
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const client = createSSRApp({ render: () => h(component, props) });
    try {
      client.mount(container);
      expect(container.firstElementChild).toBe(serverRoot);
      expect(container.querySelectorAll(".v-loader__mark")).toHaveLength(repeated ? 12 : 2);
      expect(container.querySelector('[role="status"]')?.getAttribute("aria-label")).toBe("Restoring session");
      expect(warn).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
    } finally {
      client.unmount();
      container.remove();
      warn.mockRestore();
      error.mockRestore();
    }
  });
});

describe("additional loader public types", () => {
  it("keeps the variant union closed and includes all four exact spellings", () => {
    type AddedVariant = (typeof loaders)[number]["variant"];
    expectTypeOf<AddedVariant>().toMatchTypeOf<LoaderVariant>();
    expectTypeOf<string>().not.toMatchTypeOf<LoaderVariant>();
    expectTypeOf<"dualArc" | "dotSweep" | "slidingBars">().not.toMatchTypeOf<LoaderVariant>();
    expectTypeOf<NonNullable<VLoaderProps["variant"]>>().toEqualTypeOf<LoaderVariant>();
    expect(loaderVariants).toHaveLength(36);
    expect(new Set(loaderVariants).size).toBe(loaderVariants.length);
    expect(loaderVariants).toEqual(expect.arrayContaining(loaders.map(({ variant }) => variant)));
  });

  it.each(loaders)("exposes shared, strictly typed props on $name", ({ component }) => {
    type Props = InstanceType<typeof component>["$props"];
    expectTypeOf<Props["size"]>().toEqualTypeOf<number | undefined>();
    expectTypeOf<Props["color"]>().toEqualTypeOf<string | undefined>();
    expectTypeOf<Props["duration"]>().toEqualTypeOf<number | undefined>();
    expectTypeOf<Props["label"]>().toEqualTypeOf<string | undefined>();
    expectTypeOf<Props["decorative"]>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<Props["count"]>().toEqualTypeOf<number | undefined>();
    expectTypeOf<"variant">().not.toMatchTypeOf<keyof Props>();
  });
});

const { descriptor } = parse(loaderSource);
const style = descriptor.styles.find((block) => block.scoped);
if (!style) throw new Error("VLoader must keep its scoped stylesheet");
const compiled = compileStyle({
  source: style.content, filename: "src/components/VLoader/index.vue", id: "data-v-loader-additions", scoped: true,
});
const css = compiled.rawResult?.root;
if (!css) throw new Error("VLoader styles could not be compiled");

function selectors(value: string): string[] {
  return value.replace(/\[data-v-loader-additions\]/g, "").split(",").map((selector) => selector.trim());
}

function declarationsFor(selector: string): Record<string, string> {
  const declarations: Record<string, string> = {};
  css?.walkRules((rule) => {
    if (rule.parent === css && selectors(rule.selector).includes(selector)) {
      rule.walkDecls((declaration) => { declarations[declaration.prop] = declaration.value; });
    }
  });
  return declarations;
}

function transformsFor(name: string): string[] {
  const transforms: string[] = [];
  css?.walkAtRules("keyframes", (keyframes) => {
    if (keyframes.params.startsWith(`${name}-`)) {
      keyframes.walkDecls("transform", (declaration) => { transforms.push(declaration.value); });
    }
  });
  return transforms;
}

describe("additional loader motion CSS", () => {
  it("compiles scoped styles and isolates the new keyframes", () => {
    expect(compiled.errors).toEqual([]);
    for (const name of ["breathing-halo", "dot-sweep", "sliding-bars"]) {
      expect(compiled.code).toContain(`@keyframes ${name}-loader-additions`);
    }
  });

  it("breathes an outlined halo while leaving the central dot stationary", () => {
    const halo = declarationsFor(".v-loader--breathing .v-loader__mark:first-child");
    const center = declarationsFor(".v-loader--breathing .v-loader__mark:last-child");
    expect(halo.border).toContain("solid currentColor");
    expect(halo.background).toBe("none");
    expect(halo.animation).toMatch(/^breathing-halo-loader-additions /);
    expect(center.inset).toBe("40%");
    expect(center.animation).toBeUndefined();
    expect(declarationsFor(".v-loader--breathing .v-loader__mark").animation).toBeUndefined();
    expect(declarationsFor(".v-loader__visual").animation).toBeUndefined();
    expect(transformsFor("breathing-halo")).toEqual(["scale(.86)", "scale(1.12)"]);
  });

  it("counterrotates separate concentric arcs at different speeds", () => {
    const outer = declarationsFor(".v-loader--dual-arc .v-loader__mark");
    const inner = declarationsFor(".v-loader--dual-arc .v-loader__mark:last-child");
    expect(outer.background).toBe("none");
    expect(outer.border).toContain("solid transparent");
    expect(outer["border-top-color"]).toBe("currentColor");
    expect(outer.inset).toBe("5%");
    expect(inner.inset).toBe("25%");
    expect(outer.animation).toMatch(/^spin-loader-additions /);
    expect(inner["animation-direction"]).toBe("reverse");
    expect(inner["animation-duration"]).toContain("var(--vl-duration)");
    expect(inner["border-bottom-color"]).toBe("currentColor");
  });

  it("hands dots off horizontally with count-aware phasing and room to travel", () => {
    const root = declarationsFor(".v-loader--dot-sweep");
    const mark = declarationsFor(".v-loader--dot-sweep .v-loader__mark");
    expect(root["inline-size"]).toContain("var(--vl-total)");
    expect(mark.animation).toMatch(/^dot-sweep-loader-additions /);
    expect(mark.animation).toContain("var(--vl-index)");
    expect(mark.animation).toContain("var(--vl-total)");
    expect(mark["flex-shrink"]).toBe("0");
    expect(transformsFor("dot-sweep")).toEqual(["translateX(-55%)", "translateX(55%)"]);
  });

  it("slides stacked horizontal bars in interleaved phases and grows to fit count", () => {
    const root = declarationsFor(".v-loader--sliding-bars");
    const visual = declarationsFor(".v-loader--sliding-bars .v-loader__visual");
    const mark = declarationsFor(".v-loader--sliding-bars .v-loader__mark");
    const alternating = declarationsFor(".v-loader--sliding-bars .v-loader__mark:nth-child(even)");
    expect(root["block-size"]).toContain("var(--vl-total)");
    expect(visual["flex-direction"]).toBe("column");
    expect(mark["inline-size"]).toBe("calc(var(--vl-size) * .8)");
    expect(mark["block-size"]).toBe("calc(var(--vl-size) * .1)");
    expect(mark["flex-shrink"]).toBe("0");
    expect(alternating["animation-delay"]).toBe("calc(var(--vl-duration) / -2)");
    expect(transformsFor("sliding-bars")).toEqual(["translateX(-25%)", "translateX(25%)"]);
  });

  it.each(loaders)("disables all $name motion while retaining visible marks under reduced motion", ({ component, repeated }) => {
    const reduced: Record<string, string> = {};
    css?.walkAtRules("media", (media) => {
      if (media.params !== "(prefers-reduced-motion: reduce)") return;
      media.walkRules((rule) => {
        if (selectors(rule.selector).includes(".v-loader *")) {
          rule.walkDecls((declaration) => {
            reduced[declaration.prop] = `${declaration.value}${declaration.important ? " !important" : ""}`;
          });
        }
      });
    });
    expect(reduced.animation).toBe("none !important");
    expect(reduced.transition).toBe("none !important");
    const wrapper = mount(component);
    expect(wrapper.findAll(".v-loader__mark")).toHaveLength(repeated ? 4 : 2);
    expect(declarationsFor(".v-loader__mark").display).toBe("block");
    expect(declarationsFor(".v-loader__mark").background).toBe("currentColor");
  });
});
