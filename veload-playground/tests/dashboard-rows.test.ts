import { afterEach, describe, expect, it } from "vitest";
import { enableAutoUnmount } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { VPatternSkeleton } from "veload";
import SkeletonPlayground from "~/components/SkeletonPlayground.vue";
import CodeBlock from "~/components/CodeBlock.vue";
import { findSkeletonPreset } from "~/data/catalog";

enableAutoUnmount(afterEach);

const entry = findSkeletonPreset("dashboard-skeleton")!;

describe("dashboard data row contract", () => {
  it("explains the fixed header through the visible label and associated hint", async () => {
    const screen = await mountSuspended(SkeletonPlayground, { props: { entry } });
    expect(screen.get('label[for="skeleton-rows"]').text()).toContain("Data rows");
    const input = screen.get("#skeleton-rows");
    expect(input.attributes()).toMatchObject({ min: "1", max: "12", "aria-describedby": "skeleton-rows-hint" });
    expect(screen.get("#skeleton-rows-hint").text()).toMatch(/fixed table header.*statistics and chart are separate/i);
    expect(screen.get(".prop-table").text()).toContain("dashboard always includes one fixed header");
  });

  it.each([1, 2, 12])("keeps %i data rows and every implementation tab synchronized", async (rows) => {
    const screen = await mountSuspended(SkeletonPlayground, { props: { entry } });
    await screen.get("#skeleton-rows").setValue(rows);
    await screen.get("#skeleton-columns").setValue(6);
    await screen.get("#skeleton-show-chart").setValue(false);
    await screen.get("#skeleton-color").setValue("#123456");
    expect(screen.getComponent(VPatternSkeleton).props("rows")).toBe(rows);
    expect(screen.findAll(".v-pattern-skeleton__data-row")).toHaveLength(rows);
    expect(screen.findAll(".v-pattern-skeleton__table-header")).toHaveLength(1);
    expect(screen.get(".playground__note").text()).toContain(`one fixed header + ${rows} data row`);
    expect(screen.get(".playground__template code").text()).toContain(`:rows="${rows}"`);
    const panels = screen.findAllComponents(CodeBlock);
    expect(panels[0]!.props("code")).toContain(`:rows="${rows}"`);
    expect(panels[1]!.props("code")).toContain(`const rows = ref(${rows});`);
    const typed = panels[2]!.props("code");
    expect(typed).toContain("VDashboardSkeletonProps");
    expect(typed).toContain(`rows: ${rows}`);
    expect(typed).toContain("columns: 6");
    expect(typed).toContain("showChart: false");
    expect(typed).toContain('color: "#123456"');
    expect(typed).not.toContain("showHeader:");
  });
});
