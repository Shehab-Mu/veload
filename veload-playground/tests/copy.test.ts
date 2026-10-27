import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import { useCopyCode } from "~/composables/useCopyCode";
import CodeBlock from "~/components/CodeBlock.vue";

const originalClipboard = Object.getOwnPropertyDescriptor(navigator, "clipboard");
const originalSecureContext = Object.getOwnPropertyDescriptor(window, "isSecureContext");
const originalExecCommand = Object.getOwnPropertyDescriptor(document, "execCommand");

function restoreProperty(target: object, name: string, descriptor?: PropertyDescriptor): void {
  if (descriptor) {
    Object.defineProperty(target, name, descriptor);
  } else {
    Reflect.deleteProperty(target, name);
  }
}

function configureClipboard(writeText?: (text: string) => Promise<void>, secure = true): void {
  Object.defineProperty(navigator, "clipboard", {
    value: writeText ? { writeText } : undefined,
    configurable: true,
  });
  Object.defineProperty(window, "isSecureContext", {
    value: secure,
    configurable: true,
  });
}

function configureLegacyCopy(copy: () => boolean): void {
  Object.defineProperty(document, "execCommand", {
    value: copy,
    configurable: true,
  });
}

enableAutoUnmount(afterEach);

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  restoreProperty(navigator, "clipboard", originalClipboard);
  restoreProperty(window, "isSecureContext", originalSecureContext);
  restoreProperty(document, "execCommand", originalExecCommand);
});

const CopyHarness = defineComponent({
  props: {
    code: { type: String, required: true },
  },
  setup(props) {
    const { state, message, copy } = useCopyCode(10);

    return () =>
      h("div", [
        h("button", { type: "button", onClick: () => void copy(props.code) }, [
          "Copy code",
        ]),
        h("span", { role: "status" }, message.value),
        h("span", { class: "state" }, state.value),
      ]);
  },
});

describe("copy to clipboard", () => {
  it("writes the code, reports success and resets its status", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const execCommand = vi.fn().mockReturnValue(true);
    configureClipboard(writeText);
    configureLegacyCopy(execCommand);
    const wrapper = mount(CopyHarness, { props: { code: "<VSpinLoader />" } });

    await wrapper.get("button").trigger("click");
    await flushPromises();

    expect(writeText).toHaveBeenCalledWith("<VSpinLoader />");
    expect(execCommand).not.toHaveBeenCalled();
    expect(wrapper.get('[role="status"]').text()).toBe("Copied to the clipboard");
    expect(wrapper.get(".state").text()).toBe("copied");

    await vi.advanceTimersByTimeAsync(10);
    expect(wrapper.get(".state").text()).toBe("idle");
    expect(wrapper.get('[role="status"]').text()).toBe("");
  });

  it("keeps the successful copy button focusable and guards repeat activation", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    configureClipboard(writeText);
    const wrapper = mount(CodeBlock, {
      props: { code: "<VSpinLoader />", language: "vue" },
      attachTo: document.body,
    });
    const button = wrapper.get("button").element;
    button.focus();
    button.click();
    await flushPromises();

    expect(document.activeElement).toBe(button);
    expect(button.disabled).toBe(false);
    expect(button.tabIndex).toBe(0);
    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(wrapper.get('[role="status"]').text()).toBe("Copied to the clipboard");

    button.click();
    await flushPromises();
    expect(writeText).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(2000);
    expect(document.activeElement).toBe(button);
    expect(button.getAttribute("aria-disabled")).toBe("false");
    button.click();
    await flushPromises();
    expect(writeText).toHaveBeenCalledTimes(2);
  });

  it.each(["unavailable", "insecure", "rejected"] as const)(
    "uses legacy copying when the modern API is %s and restores focus",
    async (availability) => {
      const writeText = vi.fn().mockRejectedValue(new Error("denied"));
      configureClipboard(
        availability === "unavailable" ? undefined : writeText,
        availability !== "insecure",
      );
      const execCommand = vi.fn(() => {
        expect(document.activeElement).toBeInstanceOf(HTMLTextAreaElement);
        expect((document.activeElement as HTMLTextAreaElement).value).toBe("code");
        return true;
      });
      configureLegacyCopy(execCommand);
      const wrapper = mount(CodeBlock, {
        props: { code: "code" },
        attachTo: document.body,
      });
      const button = wrapper.get("button").element;
      button.focus();
      button.click();
      await flushPromises();

      expect(writeText).toHaveBeenCalledTimes(availability === "rejected" ? 1 : 0);
      expect(execCommand).toHaveBeenCalledWith("copy");
      expect(document.querySelector("textarea")).toBeNull();
      expect(document.activeElement).toBe(button);
      expect(wrapper.get('[role="status"]').text()).toBe("Copied to the clipboard");
    },
  );

  it.each(["false", "throw"] as const)(
    "reports failure and restores focus when both APIs fail (legacy %s)",
    async (failure) => {
      configureClipboard(vi.fn().mockRejectedValue(new Error("denied")));
      const execCommand = vi.fn(() => {
        if (failure === "throw") throw new Error("copy blocked");
        return false;
      });
      configureLegacyCopy(execCommand);
      const wrapper = mount(CodeBlock, {
        props: { code: "code" },
        attachTo: document.body,
      });
      const button = wrapper.get("button").element;
      button.focus();
      button.click();
      await flushPromises();

      expect(execCommand).toHaveBeenCalledWith("copy");
      expect(document.querySelector("textarea")).toBeNull();
      expect(document.activeElement).toBe(button);
      expect(button.textContent).toBe("Try again");
      expect(button.getAttribute("aria-disabled")).toBe("false");
      expect(wrapper.get('[role="status"]').text()).toContain("Copying failed");
    },
  );

  it("clears its reset timer on unmount", async () => {
    configureClipboard(vi.fn().mockResolvedValue(undefined));
    const wrapper = mount(CopyHarness, { props: { code: "code" } });
    const timersBefore = vi.getTimerCount();
    await wrapper.get("button").trigger("click");
    await flushPromises();
    expect(vi.getTimerCount()).toBe(timersBefore + 1);

    wrapper.unmount();
    expect(vi.getTimerCount()).toBe(timersBefore);
  });
});
