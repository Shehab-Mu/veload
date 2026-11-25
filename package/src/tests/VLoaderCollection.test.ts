import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import type { Component } from "vue";
import {
  VArticleSkeleton,
  VAutoSkeleton,
  VBarsLoader,
  VBlobLoader,
  VBounceLoader,
  VCardFlipLoader,
  VCardSkeleton,
  VDashboardSkeleton,
  VDotsLoader,
  VElementLoader,
  VEqualizerLoader,
  VFallbackLoader,
  VFeedSkeleton,
  VFlowLoader,
  VFormSkeleton,
  VGradientRingLoader,
  VGridLoader,
  VHashtagLoader,
  VHeatmapLoader,
  VLiquidLoader,
  VListSkeleton,
  VLoader,
  VLogoSpinLoader,
  VMediaCardSkeleton,
  VMorphLoader,
  VOrbitDotsLoader,
  VOrbitLoader,
  VPatternSkeleton,
  VPlaneLoader,
  VProductCardSkeleton,
  VProfileSkeleton,
  VProgressRingLoader,
  VPulseLoader,
  VRingLoader,
  VRippleLoader,
  VRotateLoader,
  VSignalLoader,
  VSkeletonSwitch,
  VSnakeLoader,
  VSpinDotsLoader,
  VSpinLoader,
  VSquaresLoader,
  VStairLoader,
  VTableSkeleton,
  VTypingLoader,
  VWaveLoader,
} from "../index";

const loaderEntries: Array<[string, Component]> = [
  ["bars", VBarsLoader], ["blob", VBlobLoader], ["bounce", VBounceLoader],
  ["card-flip", VCardFlipLoader], ["dots", VDotsLoader], ["element", VElementLoader],
  ["equalizer", VEqualizerLoader], ["fallback", VFallbackLoader], ["flow", VFlowLoader],
  ["gradient-ring", VGradientRingLoader], ["grid", VGridLoader], ["hashtag", VHashtagLoader],
  ["heatmap", VHeatmapLoader], ["liquid", VLiquidLoader], ["logo-spin", VLogoSpinLoader],
  ["morph", VMorphLoader], ["orbit-dots", VOrbitDotsLoader], ["orbit", VOrbitLoader],
  ["plane", VPlaneLoader], ["progress-ring", VProgressRingLoader], ["pulse", VPulseLoader],
  ["ring", VRingLoader], ["ripple", VRippleLoader], ["rotate", VRotateLoader],
  ["signal", VSignalLoader], ["snake", VSnakeLoader], ["spin-dots", VSpinDotsLoader],
  ["spin", VSpinLoader], ["squares", VSquaresLoader], ["stair", VStairLoader],
  ["typing", VTypingLoader], ["wave", VWaveLoader],
];

const loaders = loaderEntries.map(([name, component]) => ({ name, component }));

describe("verified loader collection", () => {
  it.each(loaders)("renders $name with a labeled status", ({ name, component }) => {
    const wrapper = mount(component, { props: { size: 36, label: `${name} loading` } });

    expect(wrapper.find(".v-loader").exists()).toBe(true);
    expect(wrapper.find(".v-loader").classes()).toContain(`v-loader--${name}`);
    expect(wrapper.find(".v-loader").attributes("role")).toBe("status");
    expect(wrapper.find(".v-loader").attributes("aria-label")).toBe(`${name} loading`);
    expect(wrapper.findAll('[role="status"]')).toHaveLength(1);
    expect(wrapper.find(".v-loader__visual").attributes("aria-hidden")).toBe("true");
    expect(wrapper.find("svg").exists()).toBe(false);
  });

  it.each(loaders)("uses the shared default accessible label for $name", ({ name, component }) => {
    const wrapper = mount(component);
    const loader = wrapper.get(".v-loader");

    expect(loader.attributes("role")).toBe("status");
    expect(loader.attributes("aria-label")).toBe("Loading");
    expect(loader.attributes("aria-hidden")).toBeUndefined();
    expect(wrapper.findAll('[role="status"]')).toHaveLength(1);
    expect(wrapper.find(".v-loader__visual").attributes("aria-hidden")).toBe("true");
    expect(wrapper.find("svg").exists()).toBe(false);
  });

  it.each(loaders)("hides decorative $name from assistive technology", ({ name, component }) => {
    const wrapper = mount(component, {
      props: { label: `${name} loading`, decorative: true },
    });
    const loader = wrapper.get(".v-loader");

    expect(loader.attributes("aria-hidden")).toBe("true");
    expect(loader.attributes("role")).toBeUndefined();
    expect(loader.attributes("aria-label")).toBeUndefined();
    expect(wrapper.findAll('[role="status"]')).toHaveLength(0);
    expect(wrapper.find(".v-loader__visual").attributes("aria-hidden")).toBe("true");
    expect(wrapper.find("svg").exists()).toBe(false);
  });

  it.each(loaders)("treats an empty label on $name as decorative", ({ name, component }) => {
    const wrapper = mount(component, { props: { label: "   " } });
    const loader = wrapper.get(".v-loader");

    expect(loader.attributes("aria-hidden")).toBe("true");
    expect(loader.attributes("role")).toBeUndefined();
    expect(loader.attributes("aria-label")).toBeUndefined();
    expect(wrapper.findAll('[role="status"]')).toHaveLength(0);
  });

  it("normalizes generic loader inputs and supports decorative output", () => {
    const wrapper = mount(VLoader, {
      props: { variant: "spin", size: Number.NaN, duration: -1, count: 100, decorative: true },
    });

    expect(wrapper.attributes("aria-hidden")).toBe("true");
    expect(wrapper.findAll(".v-loader__mark")).toHaveLength(12);
    expect(wrapper.attributes("style")).toContain("--vl-size: 40px");
    expect(wrapper.attributes("style")).toContain("--vl-duration: 100ms");
  });

  it("renders all skeleton patterns and named presets", () => {
    const patterns = ["lines", "article", "card", "profile", "list", "table", "media", "form", "dashboard", "feed", "product"] as const;
    const presets: Component[] = [VArticleSkeleton, VCardSkeleton, VDashboardSkeleton, VFeedSkeleton, VFormSkeleton, VListSkeleton, VMediaCardSkeleton, VProductCardSkeleton, VProfileSkeleton, VTableSkeleton];

    for (const pattern of patterns) {
      expect(mount(VPatternSkeleton, { props: { pattern, label: "Loading content" } }).find(".v-pattern-skeleton").exists()).toBe(true);
    }
    for (const preset of presets) {
      expect(mount(preset).find(".v-pattern-skeleton").exists()).toBe(true);
    }
  });

  it("switches safely between skeleton and content", async () => {
    const wrapper = mount(VSkeletonSwitch, { props: { loading: true }, slots: { default: "Ready" } });
    expect(wrapper.find(".v-pattern-skeleton").exists()).toBe(true);
    await wrapper.setProps({ loading: false });
    expect(wrapper.text()).toContain("Ready");
    expect(mount(VAutoSkeleton, { props: { loading: true } }).find(".v-pattern-skeleton").exists()).toBe(true);
  });
});
