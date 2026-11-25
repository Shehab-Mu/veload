import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import VLoadingButton from "../components/VLoadingButton/index.vue";

describe("VLoadingButton", () => {
  it("renders a native button with a safe default type", () => {
    const wrapper = mount(VLoadingButton, {
      slots: { default: "Save" },
    });

    expect(wrapper.element.tagName).toBe("BUTTON");
    expect(wrapper.attributes("type")).toBe("button");
    expect(wrapper.text()).toContain("Save");
    expect(wrapper.attributes("disabled")).toBeUndefined();
    expect(wrapper.attributes("aria-busy")).toBeUndefined();
  });

  it("forwards native attributes and listeners", async () => {
    const onClick = vi.fn();
    const wrapper = mount(VLoadingButton, {
      attrs: {
        id: "save-button",
        name: "save",
        "aria-label": "Save changes",
        onClick,
      },
      slots: { default: "Save" },
    });

    expect(wrapper.attributes("id")).toBe("save-button");
    expect(wrapper.attributes("name")).toBe("save");
    expect(wrapper.attributes("aria-label")).toBe("Save changes");

    await wrapper.trigger("click");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("supports native button types", () => {
    const submit = mount(VLoadingButton, { props: { type: "submit" } });
    const reset = mount(VLoadingButton, { props: { type: "reset" } });
    const invalid = mount(VLoadingButton, {
      props: { type: "menu" as "button" },
    });

    expect(submit.attributes("type")).toBe("submit");
    expect(reset.attributes("type")).toBe("reset");
    expect(invalid.attributes("type")).toBe("button");
  });

  it("disables the button and exposes busy state while loading", () => {
    const wrapper = mount(VLoadingButton, {
      props: { loading: true },
      slots: { default: "Saving" },
    });

    expect(wrapper.attributes("disabled")).toBeDefined();
    expect(wrapper.attributes("aria-busy")).toBe("true");
    expect(wrapper.classes()).toContain("v-loading-button--loading");
    expect(
      wrapper.find(".v-loading-button__content").classes(),
    ).toContain("v-loading-button__content--hidden");
    expect(wrapper.find(".v-spinner").exists()).toBe(true);
    expect(wrapper.find(".v-spinner").attributes("aria-hidden")).toBe("true");
  });

  it("prevents activation while loading", async () => {
    const onClick = vi.fn();
    const wrapper = mount(VLoadingButton, {
      props: { loading: true },
      attrs: { onClick },
    });

    await wrapper.trigger("click");

    expect(onClick).not.toHaveBeenCalled();
  });

  it("respects the native disabled prop", async () => {
    const onClick = vi.fn();
    const wrapper = mount(VLoadingButton, {
      props: { disabled: true },
      attrs: { onClick },
    });

    await wrapper.trigger("click");

    expect(wrapper.attributes("disabled")).toBeDefined();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("supports a custom loading indicator", () => {
    const wrapper = mount(VLoadingButton, {
      props: { loading: true },
      slots: {
        default: "Saving",
        indicator: '<span class="custom-loader">...</span>',
      },
    });

    expect(wrapper.find(".custom-loader").exists()).toBe(true);
    expect(wrapper.find(".v-spinner").exists()).toBe(false);
  });

  it("applies a custom indicator size", () => {
    const wrapper = mount(VLoadingButton, {
      props: { loading: true, indicatorSize: 24 },
    });

    expect(
      wrapper.find(".v-spinner__indicator").attributes("style"),
    ).toContain("width: 24px");
  });

  it("restores activation and removes busy state when loading ends", async () => {
    const onClick = vi.fn();
    const wrapper = mount(VLoadingButton, {
      props: { loading: true },
      attrs: { onClick },
      slots: { default: "Save" },
    });

    expect(wrapper.attributes("disabled")).toBeDefined();
    expect(wrapper.attributes("aria-busy")).toBe("true");

    await wrapper.setProps({ loading: false });

    expect(wrapper.attributes("disabled")).toBeUndefined();
    expect(wrapper.attributes("aria-busy")).toBeUndefined();
    expect(wrapper.find(".v-spinner").exists()).toBe(false);
    expect(
      wrapper.find(".v-loading-button__content").classes(),
    ).not.toContain("v-loading-button__content--hidden");

    await wrapper.trigger("click");
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
