import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it } from "vitest";
import { VDashboardSkeleton, VPatternSkeleton, VTableSkeleton } from "../index";

const dataRows = ".v-pattern-skeleton__data-row";
const header = ".v-pattern-skeleton__table-header";

describe("dashboard data rows and fixed sections", () => {
  it.each([1, 2, 12])("renders exactly %i data rows plus one fixed header", (rows) => {
    const wrapper = mount(VDashboardSkeleton, { props: { rows, columns: 3 } });
    expect(wrapper.findAll(dataRows)).toHaveLength(rows);
    expect(wrapper.findAll(header)).toHaveLength(1);
    expect(wrapper.findAll(".v-pattern-skeleton__table-row")).toHaveLength(rows + 1);
    expect(wrapper.get(header).findAll(".v-skeleton")).toHaveLength(3);
    for (const row of wrapper.findAll(dataRows)) expect(row.findAll(".v-skeleton")).toHaveLength(3);
    expect(wrapper.get(".v-pattern-skeleton__stats").findAll(".v-skeleton")).toHaveLength(3);
    expect(wrapper.findAll(".v-skeleton--rect")).toHaveLength(4);
    expect(wrapper.attributes("aria-hidden")).toBe("true");
    wrapper.unmount();
  });

  it.each([
    [0, 1], [-2, 1], [1.6, 2], [13, 12], [Number.NaN, 3], [Infinity, 3],
  ])("normalizes rows %s to %i without counting the header", (input, expected) => {
    const wrapper = mount(VDashboardSkeleton, { props: { rows: input } });
    expect(wrapper.findAll(dataRows)).toHaveLength(expected);
    expect(wrapper.findAll(header)).toHaveLength(1);
    wrapper.unmount();
  });

  it("updates data rows and columns reactively without duplicating fixed sections", async () => {
    const wrapper = mount(VDashboardSkeleton, { props: { rows: 1, columns: 1, label: "Loading dashboard" } });
    for (const rows of [1, 2, 12]) {
      await wrapper.setProps({ rows, columns: 6 });
      expect(wrapper.findAll(dataRows)).toHaveLength(rows);
      expect(wrapper.findAll(header)).toHaveLength(1);
      expect(wrapper.get(header).findAll(".v-skeleton")).toHaveLength(6);
      expect(wrapper.get(dataRows).attributes("style")).toContain("repeat(6, minmax(0, 1fr))");
      expect(wrapper.findAll('[role="status"]')).toHaveLength(1);
    }
    await wrapper.setProps({ showStats: false, showChart: false });
    expect(wrapper.find(".v-pattern-skeleton__stats").exists()).toBe(false);
    expect(wrapper.findAll(".v-skeleton--rect")).toHaveLength(0);
    expect(wrapper.findAll(dataRows)).toHaveLength(12);
    expect(wrapper.findAll(header)).toHaveLength(1);
    wrapper.unmount();
  });

  it.each([1, 2, 12])("preserves the same row definition in SSR for %i rows", async (rows) => {
    const html = await renderToString(createSSRApp({ render: () => h(VDashboardSkeleton, { rows }) }));
    expect(html.match(/v-pattern-skeleton__data-row/g)).toHaveLength(rows);
    expect(html.match(/v-pattern-skeleton__table-header/g)).toHaveLength(1);
  });

  it("uses the same data-row markers for generic and optional-header tables", async () => {
    const generic = mount(VPatternSkeleton, { props: { pattern: "dashboard", rows: 1 } });
    expect(generic.findAll(dataRows)).toHaveLength(1);
    expect(generic.findAll(header)).toHaveLength(1);
    const table = mount(VTableSkeleton, { props: { rows: 2, showHeader: true } });
    expect(table.findAll(dataRows)).toHaveLength(2);
    expect(table.findAll(header)).toHaveLength(1);
    await table.setProps({ showHeader: false });
    expect(table.findAll(dataRows)).toHaveLength(2);
    expect(table.findAll(header)).toHaveLength(0);
    generic.unmount();
    table.unmount();
  });
});
