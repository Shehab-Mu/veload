import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import {
  VAutoSkeleton,
  VCardSkeleton,
  VDashboardSkeleton,
  VDotsLoader,
  VLoader,
  VPatternSkeleton,
  VProgressRingLoader,
  VSkeleton,
  VSkeletonGroup,
  VSkeletonSwitch,
  VSquaresLoader,
} from "../index";
import type {
  VCardSkeletonProps,
  VProgressRingLoaderProps,
  VSkeletonGroupProps,
  VSkeletonSwitchProps,
} from "../index";

describe("VLoader hardening", () => {
  it("normalizes invalid runtime text values without throwing", () => {
    const invalidProps: Record<string, unknown> = {
      color: 12,
      label: { text: "Loading" },
      variant: "not-a-loader",
      size: Number.NaN,
      duration: Number.POSITIVE_INFINITY,
      count: Number.NaN,
    };

    const wrapper = mount(VLoader, { props: invalidProps });

    expect(wrapper.classes()).toContain("v-loader--spin");
    expect(wrapper.attributes("aria-hidden")).toBe("true");
    expect(wrapper.attributes("style")).toContain("--vl-color: currentColor");
    expect(wrapper.attributes("style")).toContain("--vl-size: 40px");
  });

  it("forwards named loader props and renders a determinate progress value", () => {
    const squares = mount(VSquaresLoader, { props: { size: 32, color: "#22c55e", duration: 700 } });
    const ring = mount(VProgressRingLoader, { props: { value: 42, label: "Uploading" } });

    expect(squares.findAll(".v-loader__mark")).toHaveLength(9);
    expect(squares.attributes("style")).toContain("--vl-size: 32px");
    expect(squares.attributes("style")).toContain("--vl-duration: 700ms");
    expect(ring.find(".v-loader__value").text()).toBe("42%");
    expect(ring.attributes("aria-label")).toBe("Uploading");
  });

  it("keeps indeterminate progress rings animated by omitting a value label", () => {
    const wrapper = mount(VProgressRingLoader);
    expect(wrapper.find(".v-loader__value").exists()).toBe(false);
  });

  it("exposes the mark count on the root so repeated treatments can size themselves", () => {
    const wrapper = mount(VDotsLoader, { props: { count: 6 } });

    expect(wrapper.attributes("style")).toContain("--vl-total: 6");
    expect(wrapper.findAll(".v-loader__mark")).toHaveLength(6);
    expect(wrapper.find(".v-loader__mark").attributes("style")).not.toContain("--vl-total");
  });
});

describe("skeleton collection hardening", () => {
  it("normalizes invalid pattern text values without throwing", () => {
    const invalidProps: Record<string, unknown> = { color: 10, highlightColor: {}, label: 42, rows: Number.NaN };
    const wrapper = mount(VPatternSkeleton, { props: invalidProps });

    expect(wrapper.classes()).toContain("v-pattern-skeleton--lines");
    expect(wrapper.attributes("aria-hidden")).toBe("true");
    expect(wrapper.findAll(".v-skeleton")).toHaveLength(3);
  });

  it("renders distinct card and dashboard structures", () => {
    const card = mount(VCardSkeleton, { props: { showMedia: false, showAvatar: true, rows: 2 } });
    const dashboard = mount(VDashboardSkeleton, { props: { columns: 4, rows: 2, showChart: true } });

    expect(card.find(".v-pattern-skeleton__inline").exists()).toBe(true);
    expect(card.findAll(".v-skeleton")).toHaveLength(4);
    expect(dashboard.find(".v-pattern-skeleton__stats").exists()).toBe(true);
    expect(dashboard.findAll(".v-pattern-skeleton__table-row")).toHaveLength(3);
  });

  it("does not hide labelled descendants in an unlabelled group", () => {
    const wrapper = mount(VSkeletonGroup, { slots: { default: h(VSkeleton, { label: "Loading card" }) } });

    expect(wrapper.attributes("aria-hidden")).toBeUndefined();
    expect(wrapper.find(".v-skeleton").attributes("role")).toBe("status");
  });

  it("uses a labelled group as the single status region", () => {
    const wrapper = mount(VSkeletonGroup, { props: { label: "Loading profile" }, slots: { default: h(VSkeleton) } });

    expect(wrapper.attributes("role")).toBe("status");
    expect(wrapper.attributes("aria-busy")).toBe("true");
    expect(wrapper.find(".v-skeleton").attributes("aria-hidden")).toBe("true");
  });

  it("passes pattern options through the switch and auto switcher", async () => {
    const wrapper = mount(VSkeletonSwitch, { props: { loading: true, pattern: "table", rows: 2, columns: 4 } });
    expect(wrapper.findAll(".v-pattern-skeleton__table-row")).toHaveLength(3);

    await wrapper.setProps({ loading: false });
    expect(wrapper.find(".v-pattern-skeleton").exists()).toBe(false);
    expect(mount(VAutoSkeleton, { props: { loading: true, pattern: "product", showPrice: false } }).find(".v-pattern-skeleton--product").exists()).toBe(true);
  });

  it("renders the skeleton collection during SSR", async () => {
    const app = createSSRApp({
      render: () => h("div", [
        h(VPatternSkeleton, { pattern: "dashboard", label: "Loading dashboard" }),
        h(VSkeletonSwitch, { loading: true, pattern: "table" }),
        h(VAutoSkeleton, { loading: true, pattern: "product" }),
      ]),
    });
    const html = await renderToString(app);

    expect(html).toContain("v-pattern-skeleton--dashboard");
    expect(html).toContain("v-pattern-skeleton--table");
    expect(html).toContain("v-pattern-skeleton--product");
  });

  it("keeps the new public prop types usable", () => {
    const group: VSkeletonGroupProps = { gap: "1rem", decorative: true };
    const switchProps: VSkeletonSwitchProps = { loading: true, pattern: "list", rows: 4 };
    const card: VCardSkeletonProps = { showAvatar: true, rows: 2 };
    const ring: VProgressRingLoaderProps = { value: 50, color: "rebeccapurple" };

    expect(group.decorative).toBe(true);
    expect(switchProps.rows).toBe(4);
    expect(card.rows).toBe(2);
    expect(ring.value).toBe(50);
  });
});
