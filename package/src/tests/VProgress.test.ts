import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import VProgress from "../components/VProgress/index.vue";

function barStyle(wrapper: ReturnType<typeof mount>): CSSStyleDeclaration {
  return (
    wrapper.find(".v-progress__bar").element as HTMLElement
  ).style;
}

describe("VProgress", () => {
  it("renders an indeterminate progress bar when no value is supplied", () => {
    const wrapper = mount(VProgress);

    expect(wrapper.attributes("role")).toBe("progressbar");
    expect(wrapper.attributes("aria-label")).toBe("Progress");
    expect(wrapper.classes()).toContain("v-progress--indeterminate");
    expect(wrapper.attributes("aria-valuenow")).toBeUndefined();
    expect(wrapper.attributes("aria-valuemin")).toBeUndefined();
    expect(wrapper.attributes("aria-valuemax")).toBeUndefined();
  });

  it("renders determinate progress with default range", () => {
    const wrapper = mount(VProgress, { props: { value: 50 } });

    expect(wrapper.classes()).toContain("v-progress--determinate");
    expect(wrapper.attributes("aria-valuemin")).toBe("0");
    expect(wrapper.attributes("aria-valuemax")).toBe("100");
    expect(wrapper.attributes("aria-valuenow")).toBe("50");
    expect(barStyle(wrapper).width).toBe("50%");
  });

  it("supports custom min and max ranges", () => {
    const wrapper = mount(VProgress, {
      props: { value: 5, min: 0, max: 10, label: "Upload" },
    });

    expect(wrapper.attributes("aria-valuemax")).toBe("10");
    expect(wrapper.attributes("aria-valuenow")).toBe("5");
    expect(barStyle(wrapper).width).toBe("50%");
    expect(wrapper.attributes("aria-label")).toBe("Upload");
  });

  it("clamps values to the supported range", () => {
    const below = mount(VProgress, { props: { value: -20 } });
    const above = mount(VProgress, { props: { value: 150 } });

    expect(below.attributes("aria-valuenow")).toBe("0");
    expect(barStyle(below).width).toBe("0%");
    expect(above.attributes("aria-valuenow")).toBe("100");
    expect(barStyle(above).width).toBe("100%");
  });

  it("renders zero percent as determinate", () => {
    const wrapper = mount(VProgress, { props: { value: 0 } });

    expect(wrapper.classes()).toContain("v-progress--determinate");
    expect(wrapper.attributes("aria-valuenow")).toBe("0");
    expect(barStyle(wrapper).width).toBe("0%");
  });

  it("falls back to indeterminate for invalid values or ranges", () => {
    const invalidValue = mount(VProgress, {
      props: { value: Number.NaN },
    });
    const invalidRange = mount(VProgress, {
      props: { value: 50, min: 100, max: 100 },
    });
    const nonFiniteRange = mount(VProgress, {
      props: { value: 50, min: Number.NEGATIVE_INFINITY, max: Number.NaN },
    });

    for (const wrapper of [invalidValue, invalidRange, nonFiniteRange]) {
      expect(wrapper.classes()).toContain("v-progress--indeterminate");
      expect(wrapper.attributes("aria-valuenow")).toBeUndefined();
    }
  });

  it("only exposes value text for determinate progress", () => {
    const determinate = mount(VProgress, {
      props: { value: 3, valueText: "3 of 10 files" },
    });
    const indeterminate = mount(VProgress, {
      props: { valueText: "3 of 10 files" },
    });

    expect(determinate.attributes("aria-valuetext")).toBe("3 of 10 files");
    expect(indeterminate.attributes("aria-valuetext")).toBeUndefined();
  });

  it("supports custom dimensions and colors", () => {
    const wrapper = mount(VProgress, {
      props: {
        value: 25,
        height: "1rem",
        color: "#22C55E",
        trackColor: "#F1F5F9",
      },
    });

    expect((wrapper.element as HTMLElement).style.height).toBe("1rem");
    expect((wrapper.element as HTMLElement).style.backgroundColor).toBe(
      "rgb(241, 245, 249)",
    );
    expect(barStyle(wrapper).backgroundColor).toBe("rgb(34, 197, 94)");
  });

  it("normalizes an invalid height", () => {
    const wrapper = mount(VProgress, {
      props: { value: 10, height: Number.NaN },
    });

    expect((wrapper.element as HTMLElement).style.height).toBe("8px");
  });

  it("omits the accessible name when the label is blank", () => {
    const wrapper = mount(VProgress, { props: { label: "  " } });

    expect(wrapper.attributes("aria-label")).toBeUndefined();
  });

  it("updates ARIA value attributes as the value changes", async () => {
    const wrapper = mount(VProgress, { props: { value: 10 } });

    expect(wrapper.attributes("aria-valuenow")).toBe("10");

    await wrapper.setProps({ value: 75 });
    expect(wrapper.attributes("aria-valuenow")).toBe("75");
    expect(barStyle(wrapper).width).toBe("75%");

    await wrapper.setProps({ value: null });
    expect(wrapper.attributes("aria-valuenow")).toBeUndefined();
    expect(wrapper.attributes("aria-valuemin")).toBeUndefined();
    expect(wrapper.classes()).toContain("v-progress--indeterminate");
  });
});
