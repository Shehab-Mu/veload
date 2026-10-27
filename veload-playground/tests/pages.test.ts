import { describe, expect, it } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { loaders, skeletonPresets } from "~/data/catalog";
import HomePage from "~/pages/index.vue";
import LoadersPage from "~/pages/loaders/index.vue";
import LoaderDetailPage from "~/pages/loaders/[name].vue";
import SkeletonsPage from "~/pages/skeletons/index.vue";
import SkeletonDetailPage from "~/pages/skeletons/[name].vue";
import InstallationPage from "~/pages/docs/installation.vue";
import AccessibilityPage from "~/pages/docs/accessibility.vue";
import ApiPage from "~/pages/docs/api.vue";
import LoaderPlayground from "~/components/LoaderPlayground.vue";

describe("documentation pages", () => {
  it("renders the landing page with a single heading and curated previews", async () => {
    const screen = await mountSuspended(HomePage);

    expect(screen.findAll("h1")).toHaveLength(1);
    expect(screen.get("h1").text()).toContain("Make waiting");
    expect(screen.findAll("h2").length).toBeGreaterThan(2);
    expect(screen.findAll(".loader-card").length).toBeGreaterThan(0);
    expect(screen.findAll(".loader-card").length).toBeLessThan(loaders.length);
    expect(screen.text()).toContain(`View all ${loaders.length} loaders`);
    expect(screen.text()).toContain("View all skeleton patterns");
  });

  it("renders every core component on the landing page", async () => {
    const screen = await mountSuspended(HomePage);

    for (const selector of [
      ".v-spinner",
      ".v-progress",
      ".v-loading-button",
      ".v-loading",
      ".v-loader",
      ".v-skeleton",
    ]) {
      expect(screen.find(selector).exists(), selector).toBe(true);
    }
  });

  it("renders every loader on the collection page", async () => {
    const screen = await mountSuspended(LoadersPage);

    expect(screen.findAll("h1")).toHaveLength(1);
    expect(screen.findAll(".loader-card")).toHaveLength(loaders.length);
    expect(screen.text()).toContain(`${loaders.length} loaders match the current filters.`);
    expect(screen.get("#loader-search").exists()).toBe(true);
  });

  it("links every loader card to its detail page", async () => {
    const screen = await mountSuspended(LoadersPage);
    const hrefs = screen
      .findAll(".loader-card")
      .map((card) => card.attributes("href"));

    for (const entry of loaders) {
      expect(hrefs).toContain(`/loaders/${entry.slug}`);
    }
  });

  it("renders a loader detail page with preview, controls and code", async () => {
    const screen = await mountSuspended(LoaderDetailPage, {
      route: { params: { name: "spin" } },
    });

    expect(screen.findAll("h1")).toHaveLength(1);
    expect(screen.get("h1").text()).toContain("Spin");
    expect(screen.find(".v-loader").exists()).toBe(true);
    expect(screen.get("#loader-size").exists()).toBe(true);
    expect(screen.get("#loader-duration").exists()).toBe(true);
    expect(screen.get("#loader-color").exists()).toBe(true);
    expect(screen.get("#loader-label").exists()).toBe(true);
    expect(screen.findAll('[role="tab"]').length).toBeGreaterThan(2);
    expect(screen.text()).toContain("Copy code");
  });

  it("keeps label and decorative controls, preview semantics, and Vue snippets in sync for all loaders", async () => {
    for (const entry of loaders) {
      const screen = await mountSuspended(LoaderPlayground, { props: { entry } });
      const labelControl = screen.get("#loader-label");
      const decorativeControl = screen.get("#loader-decorative");
      const preview = screen.get(".v-loader");

      expect(labelControl.exists(), `${entry.name} has an accessible label control`).toBe(true);
      expect(decorativeControl.exists(), `${entry.name} has a decorative control`).toBe(true);
      expect(preview.attributes("role")).toBe("status");
      expect(preview.attributes("aria-label")).toBe("Loading content");
      expect(preview.find(".v-loader__visual").attributes("aria-hidden")).toBe("true");

      await labelControl.setValue("Updating inventory");
      expect(preview.attributes("aria-label")).toBe("Updating inventory");
      expect(screen.get(".playground__template code").text()).toContain(
        'label="Updating inventory"',
      );

      const compositionTab = screen
        .findAll('[role="tab"]')
        .find((tab) => tab.text().trim() === "Composition API");
      expect(compositionTab).toBeDefined();
      await compositionTab!.trigger("click");
      const compositionPanelId = compositionTab!.attributes("aria-controls");
      expect(screen.get(`#${compositionPanelId}`).text()).toContain(
        'const label = ref("Updating inventory");',
      );

      await decorativeControl.setValue(true);
      expect(preview.attributes("aria-hidden")).toBe("true");
      expect(preview.attributes("role")).toBeUndefined();
      expect(preview.attributes("aria-label")).toBeUndefined();
      expect(screen.get(".playground__template code").text()).toContain("decorative");
      expect(screen.get(`#${compositionPanelId}`).text()).toContain(
        "const decorative = ref(true);",
      );

      await decorativeControl.setValue(false);
      await labelControl.setValue("");
      expect(preview.attributes("aria-hidden")).toBe("true");
      expect(preview.attributes("role")).toBeUndefined();
      expect(screen.get(".playground__template code").text()).toContain('label=""');
      expect(screen.get(`#${compositionPanelId}`).text()).toContain('const label = ref("");');

      screen.unmount();
    }
  });

  it("exposes the loader preview as a labelled status", async () => {
    const screen = await mountSuspended(LoaderDetailPage, {
      route: { params: { name: "spin" } },
    });

    const loader = screen.get(".v-loader");

    expect(loader.attributes("role")).toBe("status");
    expect(loader.attributes("aria-label")).toBe("Loading content");
  });

  it("shows the progress value control only for the progress ring", async () => {
    const ring = await mountSuspended(LoaderDetailPage, {
      route: { params: { name: "progress-ring" } },
    });
    const spin = await mountSuspended(LoaderDetailPage, {
      route: { params: { name: "spin" } },
    });

    expect(ring.get("#loader-determinate").exists()).toBe(true);
    expect(spin.find("#loader-determinate").exists()).toBe(false);
  });

  it("reveals the value slider when the progress ring becomes determinate", async () => {
    const screen = await mountSuspended(LoaderDetailPage, {
      route: { params: { name: "progress-ring" } },
    });

    expect(screen.find("#loader-value").exists()).toBe(false);

    await screen.get("#loader-determinate").setValue(true);

    expect(screen.get("#loader-value").exists()).toBe(true);
    expect(screen.get(".v-loader__value").text()).toBe("40%");
  });

  it("renders the skeleton collection with primitives, patterns and presets", async () => {
    const screen = await mountSuspended(SkeletonsPage);

    expect(screen.findAll("h1")).toHaveLength(1);
    expect(screen.text()).toContain("VSkeleton");
    expect(screen.text()).toContain("VPatternSkeleton");
    expect(screen.text()).toContain("VSkeletonSwitch");
    expect(screen.text()).toContain("VAutoSkeleton");
    expect(screen.findAll(".pattern").length).toBe(11);
    expect(screen.findAll(".preset-grid .skeleton-card")).toHaveLength(
      skeletonPresets.length,
    );
  });

  it("renders a skeleton detail page with preview, controls and code", async () => {
    const screen = await mountSuspended(SkeletonDetailPage, {
      route: { params: { name: "card-skeleton" } },
    });

    expect(screen.findAll("h1")).toHaveLength(1);
    expect(screen.get("h1").text()).toContain("Card");
    expect(screen.find(".v-pattern-skeleton").exists()).toBe(true);
    expect(screen.get("#skeleton-rows").exists()).toBe(true);
    expect(screen.findAll('[role="tab"]').length).toBeGreaterThan(2);
  });

  it("renders the documentation pages", async () => {
    const installation = await mountSuspended(InstallationPage);
    const accessibility = await mountSuspended(AccessibilityPage);
    const api = await mountSuspended(ApiPage);

    expect(installation.findAll("h1")).toHaveLength(1);
    expect(installation.text()).toContain("veload/style.css");
    expect(accessibility.findAll("h1")).toHaveLength(1);
    expect(accessibility.text()).toContain("prefers-reduced-motion");
    expect(api.findAll("h1")).toHaveLength(1);
    expect(api.findAll("table").length).toBeGreaterThan(5);
  });

  it("uses a table with a row header for every prop table", async () => {
    const screen = await mountSuspended(ApiPage);
    const tables = screen.findAll("table");

    expect(tables.length).toBeGreaterThan(0);

    for (const table of tables) {
      expect(table.findAll("th[scope='row']").length).toBeGreaterThan(0);
    }
  });
});
