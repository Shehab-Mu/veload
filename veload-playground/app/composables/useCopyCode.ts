import { onBeforeUnmount, ref } from "vue";

export type CopyState = "idle" | "copied" | "error";

/**
 * Copies text to the clipboard and exposes a short lived status message.
 *
 * The asynchronous clipboard API is used when it is available and permitted.
 * A hidden textarea with the legacy `execCommand` path is used as a fallback
 * so the button still works in browsers that block the clipboard API.
 */
export function useCopyCode(resetAfter = 2000) {
  const state = ref<CopyState>("idle");
  const message = ref("");

  let timer: ReturnType<typeof setTimeout> | null = null;

  function scheduleReset(): void {
    if (timer !== null) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      state.value = "idle";
      message.value = "";
      timer = null;
    }, resetAfter);
  }

  function legacyCopy(text: string): boolean {
    if (typeof document === "undefined") {
      return false;
    }

    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-1000px";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);

    try {
      textarea.focus({ preventScroll: true });
      textarea.select();
      return document.execCommand("copy");
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
      if (previousFocus?.isConnected) {
        previousFocus.focus({ preventScroll: true });
      }
    }
  }

  async function copy(text: string): Promise<void> {
    state.value = "idle";
    message.value = "";

    try {
      let copied = false;

      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(text);
          copied = true;
        } catch {
          // A denied modern API can still allow the legacy copy command.
        }
      }

      if (!copied && !legacyCopy(text)) {
        throw new Error("Clipboard is unavailable");
      }

      state.value = "copied";
      message.value = "Copied to the clipboard";
    } catch {
      state.value = "error";
      message.value = "Copying failed. Select the code and copy it manually.";
    }

    scheduleReset();
  }

  onBeforeUnmount(() => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  });

  return { state, message, copy };
}
