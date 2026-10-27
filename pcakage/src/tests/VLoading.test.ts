import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import VLoading from "../components/VLoading/index.vue";

describe("VLoading", () => {
  it("renders content without an overlay when idle", () => {
    const wrapper = mount(VLoading, {
      slots: { default: "<p>Content</p>" },
    });

    expect(wrapper.text()).toContain("Content");
    expect(wrapper.find(".v-loading__overlay").exists()).toBe(false);
    expect(wrapper.attributes("aria-busy")).toBeUndefined();
  });

  it("shows an accessible overlay and marks content busy while loading", () => {
    const wrapper = mount(VLoading, {
      props: { loading: true, label: "Loading products" },
      slots: { default: "<p>Content</p>" },
    });

    const overlay = wrapper.find(".v-loading__overlay");

    expect(overlay.exists()).toBe(true);
    expect(overlay.attributes("role")).toBe("status");
    expect(overlay.text()).toContain("Loading products");
    expect(wrapper.attributes("aria-busy")).toBe("true");
    expect(wrapper.find(".v-loading__content").attributes("inert")).toBeDefined();
  });

  it("renders the default spinner as decorative", () => {
    const wrapper = mount(VLoading, { props: { loading: true } });
    const spinner = wrapper.find(".v-spinner");

    expect(spinner.exists()).toBe(true);
    expect(spinner.attributes("aria-hidden")).toBe("true");
    expect(spinner.attributes("role")).toBeUndefined();
  });

  it("supports a custom indicator slot", () => {
    const wrapper = mount(VLoading, {
      props: { loading: true },
      slots: {
        indicator: '<div class="custom-indicator">Wait</div>',
      },
    });

    expect(wrapper.find(".custom-indicator").exists()).toBe(true);
    expect(wrapper.find(".v-spinner").exists()).toBe(false);
  });

  it("can leave content interactive", () => {
    const wrapper = mount(VLoading, {
      props: { loading: true, inertContent: false },
    });

    expect(wrapper.find(".v-loading__content").attributes("inert")).toBeUndefined();
    expect(wrapper.classes()).not.toContain("v-loading--blocking");
  });

  it("blocks pointer interaction when content is inert", () => {
    const wrapper = mount(VLoading, { props: { loading: true } });

    expect(wrapper.classes()).toContain("v-loading--blocking");
  });

  it("omits the status role when the label is blank", () => {
    const wrapper = mount(VLoading, {
      props: { loading: true, label: "   " },
    });

    const overlay = wrapper.find(".v-loading__overlay");

    expect(overlay.attributes("role")).toBeUndefined();
    expect(overlay.attributes("aria-hidden")).toBe("true");
  });

  it("updates overlay and inert state when loading changes", async () => {
    const wrapper = mount(VLoading, {
      props: { loading: false, label: "Loading content" },
      slots: { default: "<p>Content</p>" },
    });

    expect(wrapper.find(".v-loading__overlay").exists()).toBe(false);

    await wrapper.setProps({ loading: true });

    expect(wrapper.find(".v-loading__overlay").exists()).toBe(true);
    expect(wrapper.find(".v-loading__content").attributes("inert")).toBeDefined();

    await wrapper.setProps({ loading: false });

    expect(wrapper.find(".v-loading__overlay").exists()).toBe(false);
    expect(wrapper.find(".v-loading__content").attributes("inert")).toBeUndefined();
    expect(wrapper.attributes("aria-busy")).toBeUndefined();
  });

  it("updates the accessible label while loading", async () => {
    const wrapper = mount(VLoading, {
      props: { loading: true, label: "Loading content" },
    });

    const overlay = wrapper.find(".v-loading__overlay");
    expect(overlay.attributes("role")).toBe("status");
    expect(overlay.attributes("aria-hidden")).toBeUndefined();
    expect(overlay.text()).toContain("Loading content");

    await wrapper.setProps({ label: "Refreshing content" });

    expect(wrapper.find(".v-loading__overlay").text()).toContain(
      "Refreshing content",
    );

    await wrapper.setProps({ label: "   " });

    expect(wrapper.find(".v-loading__overlay").attributes("role")).toBeUndefined();
    expect(wrapper.find(".v-loading__overlay").attributes("aria-hidden")).toBe(
      "true",
    );
  });

  it("applies custom indicator sizing and root state classes", () => {
    const wrapper = mount(VLoading, {
      props: { loading: true, indicatorSize: 48 },
    });

    const indicator = wrapper.find(".v-spinner__indicator");

    expect(wrapper.classes()).toContain("v-loading--active");
    expect(wrapper.classes()).toContain("v-loading--blocking");
    expect(indicator.attributes("style")).toContain("width: 48px");
  });
});
