import { describe, expect, it } from "vitest";
import { createSSRApp, h, type Component } from "vue";
import { renderToString } from "vue/server-renderer";
import {
  VBarsLoader, VBlobLoader, VBounceLoader, VCardFlipLoader, VDotsLoader, VElementLoader,
  VEqualizerLoader, VFallbackLoader, VFlowLoader, VGradientRingLoader, VGridLoader,
  VHashtagLoader, VHeatmapLoader, VLiquidLoader, VLogoSpinLoader, VMorphLoader,
  VOrbitDotsLoader, VOrbitLoader, VPlaneLoader, VProgressRingLoader, VPulseLoader,
  VRingLoader, VRippleLoader, VRotateLoader, VSignalLoader, VSnakeLoader, VSpinDotsLoader,
  VSpinLoader, VSquaresLoader, VStairLoader, VTypingLoader, VWaveLoader,
} from "../index";

const loaders: Component[] = [
  VBarsLoader, VBlobLoader, VBounceLoader, VCardFlipLoader, VDotsLoader, VElementLoader,
  VEqualizerLoader, VFallbackLoader, VFlowLoader, VGradientRingLoader, VGridLoader,
  VHashtagLoader, VHeatmapLoader, VLiquidLoader, VLogoSpinLoader, VMorphLoader,
  VOrbitDotsLoader, VOrbitLoader, VPlaneLoader, VProgressRingLoader, VPulseLoader,
  VRingLoader, VRippleLoader, VRotateLoader, VSignalLoader, VSnakeLoader, VSpinDotsLoader,
  VSpinLoader, VSquaresLoader, VStairLoader, VTypingLoader, VWaveLoader,
];

const accessibilityCases: Array<{
  name: string;
  props: Record<string, unknown>;
  status: boolean;
}> = [
  { name: "default label", props: {}, status: true },
  { name: "custom label", props: { label: "Updating inventory" }, status: true },
  {
    name: "decorative",
    props: { label: "Updating inventory", decorative: true },
    status: false,
  },
  { name: "empty label", props: { label: "   " }, status: false },
];

describe("loader collection server-side rendering", () => {
  it("renders every named loader without browser globals", async () => {
    const app = createSSRApp({
      render: () => h("div", loaders.map((loader) => h(loader, { label: "Rendering" }))),
    });
    const html = await renderToString(app);

    expect((html.match(/v-loader/g) ?? []).length).toBeGreaterThanOrEqual(loaders.length);
    expect((html.match(/role="status"/g) ?? []).length).toBe(loaders.length);
  });

  it.each(accessibilityCases)("renders all named loaders with correct SSR semantics for $name", async ({ props, status }) => {
    const app = createSSRApp({
      render: () => h("div", loaders.map((loader) => h(loader, props))),
    });
    const html = await renderToString(app);
    const roots = html.match(/<span class="v-loader v-loader--[^"]+"[^>]*>/g) ?? [];

    expect(roots).toHaveLength(loaders.length);
    expect((html.match(/role="status"/g) ?? [])).toHaveLength(status ? loaders.length : 0);

    if (status) {
      const expectedLabel = typeof props.label === "string" ? props.label.trim() : "Loading";
      const normalizedLabel = expectedLabel || "Loading";
      expect((html.match(new RegExp(`aria-label="${normalizedLabel}"`, "g")) ?? [])).toHaveLength(loaders.length);
      expect(roots.every((root) => !root.includes('aria-hidden="true"'))).toBe(true);
    } else {
      expect(roots.every((root) => root.includes('aria-hidden="true"'))).toBe(true);
      expect((html.match(/aria-label=/g) ?? [])).toHaveLength(0);
    }

    expect((html.match(/class="v-loader__visual" aria-hidden="true"/g) ?? [])).toHaveLength(loaders.length);
    expect(html).not.toContain("<svg");
  });
});
