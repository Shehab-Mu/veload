import { describe, expect, it } from "vitest";
import { defineComponent } from "vue";
import { mount } from "@vue/test-utils";
import VLoading from "../components/VLoading/index.vue";
import VLoadingButton from "../components/VLoadingButton/index.vue";
import VSpinner from "../components/VSpinner/index.vue";

/**
 * Verifies runtime prop inference for attributes that are used without values
 * in templates, such as `<VLoading loading>`.
 */
describe("bare boolean template attributes", () => {
  it("treats a bare VLoading loading attribute as true", () => {
    const Parent = defineComponent({
      components: { VLoading },
      template: '<VLoading loading label="Loading">Content</VLoading>',
    });
    const wrapper = mount(Parent);

    expect(wrapper.find(".v-loading__overlay").exists()).toBe(true);
    expect(wrapper.find(".v-loading").attributes("aria-busy")).toBe("true");
  });

  it("treats a bare VLoadingButton loading attribute as true", () => {
    const Parent = defineComponent({
      components: { VLoadingButton },
      template: "<VLoadingButton loading>Save</VLoadingButton>",
    });
    const wrapper = mount(Parent);

    expect(wrapper.find("button").attributes("disabled")).toBeDefined();
    expect(wrapper.find("button").attributes("aria-busy")).toBe("true");
  });

  it("treats a bare VSpinner decorative attribute as true", () => {
    const Parent = defineComponent({
      components: { VSpinner },
      template: "<VSpinner decorative />",
    });
    const wrapper = mount(Parent);

    expect(wrapper.find(".v-spinner").attributes("aria-hidden")).toBe("true");
    expect(wrapper.find(".v-spinner").attributes("role")).toBeUndefined();
  });

  it("does not treat omitted boolean props as true", () => {
    const Parent = defineComponent({
      components: { VLoading },
      template: "<VLoading>Content</VLoading>",
    });
    const wrapper = mount(Parent);

    expect(wrapper.find(".v-loading__overlay").exists()).toBe(false);
    expect(wrapper.find(".v-loading").attributes("aria-busy")).toBeUndefined();
  });

  it("passes attrs through to the native button element", () => {
    const Parent = defineComponent({
      components: { VLoadingButton },
      template:
        '<VLoadingButton id="submit" name="save" type="submit" aria-label="Save">Save</VLoadingButton>',
    });
    const wrapper = mount(Parent);
    const button = wrapper.find("button");

    expect(button.attributes("id")).toBe("submit");
    expect(button.attributes("name")).toBe("save");
    expect(button.attributes("type")).toBe("submit");
    expect(button.attributes("aria-label")).toBe("Save");
  });

  it("renders a custom indicator slot through a template", () => {
    const Parent = defineComponent({
      components: { VLoading },
      template: `
        <VLoading loading label="Loading">
          Content
          <template #indicator><span class="custom">Wait</span></template>
        </VLoading>
      `,
    });
    const wrapper = mount(Parent);

    expect(wrapper.find(".custom").exists()).toBe(true);
    expect(wrapper.find(".v-spinner").exists()).toBe(false);
    expect(wrapper.find(".custom").element.tagName).toBe("SPAN");
  });

  it("renders default content when the slot is absent", () => {
    const wrapper = mount(VLoading, { props: { loading: false } });

    expect(wrapper.find(".v-loading__content").exists()).toBe(true);
    expect(wrapper.text()).toBe("");
  });
});
