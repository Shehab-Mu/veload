import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import VSkeleton from "../components/VSkeleton/index.vue";

function styleOf(wrapper: ReturnType<typeof mount>): CSSStyleDeclaration {
  return (wrapper.element as HTMLElement).style;
}

describe("VSkeleton", () => {
  it("renders a decorative text placeholder by default", () => {
    const wrapper = mount(VSkeleton);

    expect(wrapper.classes()).toContain("v-skeleton--text");
    expect(wrapper.classes()).toContain("v-skeleton--animated");
    expect(wrapper.attributes("aria-hidden")).toBe("true");
    expect(wrapper.attributes("role")).toBeUndefined();
    expect(styleOf(wrapper).width).toBe("100%");
    expect(styleOf(wrapper).height).toBe("1em");
  });

  it("supports rectangular and circular variants", () => {
    const rect = mount(VSkeleton, {
      props: { variant: "rect", width: 240, height: 120 },
    });
    const circle = mount(VSkeleton, { props: { variant: "circle" } });

    expect(rect.classes()).toContain("v-skeleton--rect");
    expect(styleOf(rect).width).toBe("240px");
    expect(styleOf(rect).height).toBe("120px");
    expect(styleOf(rect).borderRadius).toBe("");

    expect(circle.classes()).toContain("v-skeleton--circle");
    expect(styleOf(circle).width).toBe("40px");
    expect(styleOf(circle).height).toBe("");
    expect(styleOf(circle).aspectRatio).toBe("1 / 1");
    expect(styleOf(circle).borderRadius).toBe("");
  });

  it("accepts CSS length strings and custom border radius", () => {
    const wrapper = mount(VSkeleton, {
      props: {
        variant: "rect",
        width: "50%",
        height: "2rem",
        borderRadius: "12px",
      },
    });

    expect(styleOf(wrapper).width).toBe("50%");
    expect(styleOf(wrapper).height).toBe("2rem");
    expect(styleOf(wrapper).borderRadius).toBe("12px");
  });

  it("normalizes invalid and negative numeric dimensions", () => {
    const invalid = mount(VSkeleton, {
      props: { variant: "rect", width: Number.NaN, height: Number.POSITIVE_INFINITY },
    });
    const negative = mount(VSkeleton, {
      props: { variant: "rect", width: -20, height: -1 },
    });

    expect(styleOf(invalid).width).toBe("100%");
    expect(styleOf(invalid).height).toBe("6rem");
    expect(styleOf(negative).width).toBe("0px");
    expect(styleOf(negative).height).toBe("0px");
  });

  it("ignores invalid border radius values so shape defaults apply", () => {
    const invalidNumber = mount(VSkeleton, {
      props: { variant: "rect", borderRadius: Number.NaN },
    });
    const blank = mount(VSkeleton, {
      props: { variant: "text", borderRadius: "   " },
    });

    expect(styleOf(invalidNumber).borderRadius).toBe("");
    expect(invalidNumber.classes()).toContain("v-skeleton--rect");
    expect(styleOf(blank).borderRadius).toBe("");
  });

  it("can disable the animation", () => {
    const wrapper = mount(VSkeleton, { props: { animated: false } });

    expect(wrapper.classes()).not.toContain("v-skeleton--animated");
  });

  it("exposes an accessible placeholder when labelled", () => {
    const wrapper = mount(VSkeleton, {
      props: { label: "Loading profile" },
    });

    expect(wrapper.attributes("role")).toBe("status");
    expect(wrapper.attributes("aria-label")).toBe("Loading profile");
    expect(wrapper.attributes("aria-busy")).toBe("true");
    expect(wrapper.attributes("aria-hidden")).toBeUndefined();
  });

  it("treats a blank label as decorative", () => {
    const wrapper = mount(VSkeleton, { props: { label: "   " } });

    expect(wrapper.attributes("aria-hidden")).toBe("true");
    expect(wrapper.attributes("role")).toBeUndefined();
  });

  it("falls back to the text variant for unknown runtime values", () => {
    const wrapper = mount(VSkeleton, {
      props: { variant: "hexagon" as "text" },
    });

    expect(wrapper.classes()).toContain("v-skeleton--text");
    expect(wrapper.attributes("aria-hidden")).toBe("true");
  });

  it("updates accessibility attributes when the label changes", async () => {
    const wrapper = mount(VSkeleton);

    expect(wrapper.attributes("aria-hidden")).toBe("true");

    await wrapper.setProps({ label: "Loading content" });

    expect(wrapper.attributes("role")).toBe("status");
    expect(wrapper.attributes("aria-label")).toBe("Loading content");
    expect(wrapper.attributes("aria-hidden")).toBeUndefined();

    await wrapper.setProps({ label: "" });

    expect(wrapper.attributes("role")).toBeUndefined();
    expect(wrapper.attributes("aria-label")).toBeUndefined();
    expect(wrapper.attributes("aria-hidden")).toBe("true");
  });
});
