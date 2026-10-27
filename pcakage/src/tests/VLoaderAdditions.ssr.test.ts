// @vitest-environment node
import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import {
  VBreathingLoader,
  VDotSweepLoader,
  VDualArcLoader,
  VLoader,
  VSlidingBarsLoader,
} from "../index";

const loaders = [
  { name: "VBreathingLoader", variant: "breathing", component: VBreathingLoader, repeated: false },
  { name: "VDualArcLoader", variant: "dual-arc", component: VDualArcLoader, repeated: false },
  { name: "VDotSweepLoader", variant: "dot-sweep", component: VDotSweepLoader, repeated: true },
  { name: "VSlidingBarsLoader", variant: "sliding-bars", component: VSlidingBarsLoader, repeated: true },
] as const;

const accessibilityCases = [
  { name: "default label", props: {}, label: "Loading" },
  { name: "custom label", props: { label: "  Preparing workspace  " }, label: "Preparing workspace" },
  { name: "decorative", props: { label: "Preparing workspace", decorative: true }, label: undefined },
  { name: "empty label", props: { label: " \n\t " }, label: undefined },
];

describe("additional loaders in browser-free SSR", () => {
  it("runs without DOM or animation globals", () => {
    expect(typeof window).toBe("undefined");
    expect(typeof document).toBe("undefined");
    expect(typeof requestAnimationFrame).toBe("undefined");
  });

  describe.each(loaders)("$name", ({ component, variant, repeated }) => {
    it.each(accessibilityCases)("preserves $name accessibility", async ({ props, label }) => {
      const html = await renderToString(createSSRApp({ render: () => h(component, props) }));
      const root = html.match(/^<span\b[^>]*>/)?.[0] ?? "";

      expect(root).toContain(`v-loader--${variant}`);
      expect(html.match(/role="status"/g) ?? []).toHaveLength(label ? 1 : 0);
      if (label) {
        expect(root).toContain(`aria-label="${label}"`);
        expect(root).not.toContain('aria-hidden="true"');
      } else {
        expect(root).toContain('aria-hidden="true"');
        expect(root).not.toContain("aria-label=");
      }
      expect(html).toContain('class="v-loader__visual" aria-hidden="true"');
      expect(html).not.toContain("<svg");
    });

    it.each([
      { count: 0, expected: 1 },
      { count: 2.5, expected: 3 },
      { count: 12, expected: 12 },
      { count: 1000, expected: 12 },
      { count: Number.NaN, expected: 4 },
    ])("keeps server mark counts bounded for $count", async ({ count, expected }) => {
      const props = { count, size: 32, duration: 800, color: "teal", "data-request": "ssr" };
      const html = await renderToString(createSSRApp({ render: () => h(component, props) }));
      const generic = await renderToString(createSSRApp({ render: () => h(VLoader, { ...props, variant }) }));

      expect(html).toBe(generic);
      expect(html.match(/class="v-loader__mark"/g) ?? []).toHaveLength(repeated ? expected : 2);
      expect(html).toContain(`--vl-total:${repeated ? expected : 2}`);
      expect(html).toContain("--vl-size:32px");
      expect(html).toContain("--vl-color:teal");
      expect(html).toContain("--vl-duration:800ms");
      expect(html).toContain('data-request="ssr"');
      expect(html).not.toMatch(/NaN|Infinity/);
    });

    it("escapes its label and produces deterministic server markup", async () => {
      const render = () => renderToString(createSSRApp({
        render: () => h(component, { label: 'Preparing <archive> & "assets"', count: 5 }),
      }));
      const first = await render();
      expect(first).toContain('aria-label="Preparing &lt;archive&gt; &amp; &quot;assets&quot;"');
      expect(first).not.toContain("<archive>");
      expect(await render()).toBe(first);
    });
  });
});
