import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import VSpinner from "../components/VSpinner/index.vue";

describe("VSpinner", () => {
  it("renders with accessible status and default label", () => {
    const wrapper = mount(VSpinner);

    expect(wrapper.attributes("role")).toBe("status");
    expect(wrapper.attributes("aria-label")).toBe("Loading");
    expect(wrapper.attributes("aria-hidden")).toBeUndefined();
  });

  it("uses the default size", () => {
    const wrapper = mount(VSpinner);

    const indicator = wrapper.find(".v-spinner__indicator");

    expect(indicator.attributes("style")).toContain("width: 24px");
    expect(indicator.attributes("style")).toContain("height: 24px");
  });

  it("accepts custom size, color, and label", () => {
    const wrapper = mount(VSpinner, {
      props: {
        size: 40,
        color: "#22C55E",
        label: "Please wait",
      },
    });

    const indicator = wrapper.find(".v-spinner__indicator");

    expect(indicator.attributes("style")).toContain("width: 40px");
    expect(indicator.attributes("style")).toContain("height: 40px");
    expect((indicator.element as HTMLElement).style.borderTopColor).toBe(
      "rgb(34, 197, 94)",
    );
    expect(wrapper.attributes("aria-label")).toBe("Please wait");
  });

  it("keeps the indicator decorative", () => {
    const wrapper = mount(VSpinner);

    expect(
      wrapper.find(".v-spinner__indicator").attributes("aria-hidden"),
    ).toBe("true");
  });

  it("normalizes negative and non-finite sizes", () => {
    const negative = mount(VSpinner, { props: { size: -10 } });
    const invalid = mount(VSpinner, { props: { size: Number.NaN } });

    expect(
      negative.find(".v-spinner__indicator").attributes("style"),
    ).toContain("width: 0px");
    expect(
      invalid.find(".v-spinner__indicator").attributes("style"),
    ).toContain("width: 24px");
  });

  it("supports decorative usage without an accessible label", () => {
    const decorative = mount(VSpinner, { props: { decorative: true } });
    const blankLabel = mount(VSpinner, { props: { label: "   " } });

    expect(decorative.attributes("aria-hidden")).toBe("true");
    expect(decorative.attributes("role")).toBeUndefined();
    expect(blankLabel.attributes("aria-hidden")).toBe("true");
    expect(blankLabel.attributes("role")).toBeUndefined();
  });

  it("falls back to currentColor for a blank color", () => {
    const wrapper = mount(VSpinner, { props: { color: "  " } });

    const indicator = wrapper.find(".v-spinner__indicator").element as HTMLElement;

    expect(indicator.style.borderTopColor).toBe("currentcolor");
  });

  it("removes status attributes when switched to decorative", async () => {
    const wrapper = mount(VSpinner);

    expect(wrapper.attributes("role")).toBe("status");

    await wrapper.setProps({ decorative: true });

    expect(wrapper.attributes("role")).toBeUndefined();
    expect(wrapper.attributes("aria-label")).toBeUndefined();
    expect(wrapper.attributes("aria-hidden")).toBe("true");

    await wrapper.setProps({ decorative: false, label: "Loading again" });

    expect(wrapper.attributes("role")).toBe("status");
    expect(wrapper.attributes("aria-label")).toBe("Loading again");
    expect(wrapper.attributes("aria-hidden")).toBeUndefined();
  });
});
