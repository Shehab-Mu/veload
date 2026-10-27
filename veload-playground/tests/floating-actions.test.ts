import { afterEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import FloatingActions from "~/components/FloatingActions.vue";

function setScrollY(value: number): void {
  Object.defineProperty(window, "scrollY", { configurable: true, value });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("floating actions", () => {
  it("keeps the GitHub and npm links available at the top of the page", () => {
    setScrollY(0);
    const wrapper = mount(FloatingActions);

    expect(wrapper.get('a[href="https://github.com/Shehab-Mu/veload"]').attributes("aria-label")).toBe(
      "Star Veload on GitHub",
    );
    expect(wrapper.get('a[href="https://www.npmjs.com/package/veload"]').attributes("aria-label")).toBe(
      "View Veload on npm",
    );
    expect(wrapper.find("button").exists()).toBe(false);
    expect(wrapper.findAll('a[target="_blank"][rel="noopener noreferrer"]')).toHaveLength(2);

    wrapper.unmount();
  });

  it("shows the scroll button past 400px and hides it again near the top", async () => {
    setScrollY(0);
    const wrapper = mount(FloatingActions);

    setScrollY(400);
    window.dispatchEvent(new Event("scroll"));
    await wrapper.vm.$nextTick();
    expect(wrapper.find("button").exists()).toBe(false);

    setScrollY(401);
    window.dispatchEvent(new Event("scroll"));
    await wrapper.vm.$nextTick();
    expect(wrapper.get('button[aria-label="Scroll to top"]').exists()).toBe(true);

    setScrollY(0);
    window.dispatchEvent(new Event("scroll"));
    await wrapper.vm.$nextTick();
    expect(wrapper.find("button").exists()).toBe(false);

    wrapper.unmount();
  });

  it("uses non-animated scrolling when reduced motion is requested", async () => {
    setScrollY(401);
    const matchMedia = vi.fn().mockReturnValue({ matches: true });
    const scrollTo = vi.fn();
    Object.defineProperty(window, "matchMedia", { configurable: true, value: matchMedia });
    Object.defineProperty(window, "scrollTo", { configurable: true, value: scrollTo });

    const wrapper = mount(FloatingActions);
    await wrapper.vm.$nextTick();
    await wrapper.get('button[aria-label="Scroll to top"]').trigger("click");

    expect(matchMedia).toHaveBeenCalledWith("(prefers-reduced-motion: reduce)");
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "auto" });

    wrapper.unmount();
  });
});
