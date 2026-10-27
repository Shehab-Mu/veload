import { afterEach, describe, expect, it } from "vitest";
import { enableAutoUnmount } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import HomePage from "~/pages/index.vue";
import ApiPage from "~/pages/docs/api.vue";
import AccessibilityPage from "~/pages/docs/accessibility.vue";
import SkeletonDetailPage from "~/pages/skeletons/[name].vue";

enableAutoUnmount(afterEach);

describe("production-readiness regressions", () => {
  it("updates every featured loader when the homepage duration changes", async () => {
    const screen = await mountSuspended(HomePage);
    await screen.get("#home-duration").setValue(2200);

    const previews = screen.findAll(".loader-card .v-loader");
    expect(previews.length).toBeGreaterThan(0);
    for (const preview of previews) {
      expect(preview.attributes("style")).toContain("--vl-duration: 2200ms");
    }
    expect(screen.text()).not.toContain("100%");
  });

  it("keeps every API reference table inside a keyboard-accessible scrolling region", async () => {
    const screen = await mountSuspended(ApiPage);
    const tables = screen.findAll(".api-table");
    expect(tables.length).toBeGreaterThan(3);
    for (const table of tables) {
      const wrapper = table.element.parentElement;
      expect(wrapper?.classList.contains("api-table__wrapper")).toBe(true);
      expect(wrapper?.getAttribute("tabindex")).toBe("0");
      expect(wrapper?.getAttribute("role")).toBe("region");
      expect(wrapper?.getAttribute("aria-label")).toBeTruthy();
    }
    expect(screen.text()).toContain("installed library build");
    expect(screen.text()).not.toContain("always describe");
  });

  it("documents native disabled buttons and Boolean overlay configuration accurately", async () => {
    const screen = await mountSuspended(AccessibilityPage);
    expect(screen.text()).toContain(':inert-content="false"');
    expect(screen.text()).toContain("natively disabled");
    expect(screen.text()).not.toContain("stays focusable");
  });

  it("describes Lines as a pattern rather than a named preset", async () => {
    const screen = await mountSuspended(SkeletonDetailPage, {
      route: { params: { name: "lines" } },
    });
    expect(screen.get(".eyebrow").text()).toBe("Skeleton pattern");
    expect(screen.get("#notes-title").text()).toBe("About this pattern");
  });
});
