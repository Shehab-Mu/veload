import { afterEach, describe, expect, it, vi } from "vitest";
import { enableAutoUnmount, flushPromises } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { RouterLink } from "vue-router";
import SkeletonsPage from "../app/pages/skeletons/index.vue";
import SkeletonDetailPage from "../app/pages/skeletons/[name].vue";
import { findSkeletonDetail, skeletonDetails, skeletonPatterns, skeletonPatternPath, skeletonPresets } from "../shared/data/skeletons";
import { documentationRoutes } from "../server/routes/sitemap.xml";

enableAutoUnmount(afterEach);

const expectedRoutes = {
  lines: "/skeletons/lines",
  article: "/skeletons/article-skeleton",
  card: "/skeletons/card-skeleton",
  profile: "/skeletons/profile-skeleton",
  list: "/skeletons/list-skeleton",
  table: "/skeletons/table-skeleton",
  media: "/skeletons/media-card-skeleton",
  form: "/skeletons/form-skeleton",
  dashboard: "/skeletons/dashboard-skeleton",
  feed: "/skeletons/feed-skeleton",
  product: "/skeletons/product-card-skeleton",
} as const;

describe("complete skeleton gallery navigation", () => {
  it("maps all eleven patterns to implemented, indexed detail routes", () => {
    const paths = documentationRoutes().map((entry) => entry.path);
    expect(skeletonPatterns).toHaveLength(11);
    expect(skeletonDetails).toHaveLength(11);
    expect(skeletonPresets).toHaveLength(10);
    for (const entry of skeletonPatterns) {
      const path = skeletonPatternPath(entry.pattern);
      expect(path).toBe(expectedRoutes[entry.pattern]);
      expect(findSkeletonDetail(path.split("/").pop() ?? "")?.pattern).toBe(entry.pattern);
      expect(paths).toContain(path);
    }
    expect(findSkeletonDetail("missing-preset")).toBeUndefined();
  });

  it("renders whole pattern and preset cards as named native links without nested controls", async () => {
    const screen = await mountSuspended(SkeletonsPage, { route: "/skeletons" });
    const patterns = screen.findAll("a.pattern");
    const presets = screen.findAll("a.skeleton-card");
    expect(patterns).toHaveLength(11);
    expect(presets).toHaveLength(10);
    for (const entry of skeletonPatterns) {
      const link = patterns.find((link) => link.attributes("href") === expectedRoutes[entry.pattern]);
      expect(link, entry.pattern).toBeDefined();
      expect(link!.attributes("aria-label")).toBe(`Explore ${entry.title} skeleton`);
    }
    for (const preset of skeletonPresets) {
      const link = presets.find((link) => link.attributes("href") === `/skeletons/${preset.slug}`);
      expect(link, preset.name).toBeDefined();
      expect(link!.attributes("aria-label")).toContain(preset.name);
    }
    for (const link of [...patterns, ...presets]) {
      expect(link.attributes("role")).toBeUndefined();
      expect(link.findAll("a, button, input")).toHaveLength(0);
      expect(link.findAll('[role="status"]')).toHaveLength(0);
      expect(link.attributes("tabindex")).not.toBe("-1");
    }
  });

  it("navigates a pattern card using the Nuxt router", async () => {
    const screen = await mountSuspended(SkeletonsPage, {
      route: "/skeletons",
      global: { components: { RouterLink } },
    });
    await screen.get('a.pattern[href="/skeletons/dashboard-skeleton"]').trigger("click", { button: 0 });
    await flushPromises();
    await vi.waitFor(() => {
      expect(screen.vm.$router.currentRoute.value.path).toBe("/skeletons/dashboard-skeleton");
    });
  });

  it.each(skeletonDetails)("renders the actual detail page for $slug", async (entry) => {
    const screen = await mountSuspended(SkeletonDetailPage, {
      route: `/skeletons/${entry.slug}`,
    });
    expect(screen.get("h1").text()).toBe(entry.title);
    expect(screen.get(".v-pattern-skeleton").classes()).toContain(`v-pattern-skeleton--${entry.pattern}`);
    expect(screen.get(".playground__template code").text()).toContain(`<${entry.name}`);
  });
});
