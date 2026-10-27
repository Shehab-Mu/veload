import { describe, expect, it } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { createSSRApp } from "vue";
import { renderToString } from "vue/server-renderer";
import LoaderPlayground from "~/components/LoaderPlayground.vue";
import { findLoader } from "~/data/catalog";

const spin = findLoader("spin")!;
const ring = findLoader("progress-ring")!;

const inputTags = (html: string): string[] => html.match(/<input[^>]*>/g) ?? [];

/**
 * Renders the playground on the server. `onMounted` never runs here, so the
 * result is the markup a visitor receives before the client application
 * hydrates.
 */
const renderOnServer = (entry: typeof spin): Promise<string> =>
  renderToString(createSSRApp(LoaderPlayground, { entry }));

describe("loader playground visible label", () => {
  it.each([
    ["spin", findLoader("spin")!],
    ["fallback", findLoader("fallback")!],
  ])("shows the default visible label for %s", async (_slug, entry) => {
    const screen = await mountSuspended(LoaderPlayground, { props: { entry } });
    const visible = screen.get(".playground__label");

    expect(visible.text()).toBe("Loading content");
    // The status region already announces the label, so the visible copy must
    // not be announced a second time.
    expect(visible.attributes("aria-hidden")).toBe("true");
    expect(screen.get(".v-loader").attributes("aria-label")).toBe("Loading content");
  });

  it("updates the visible label when the input changes", async () => {
    const screen = await mountSuspended(LoaderPlayground, {
      props: { entry: spin },
    });

    await screen.get("#loader-label").setValue("Loading snake animation");

    expect(screen.get(".playground__label").text()).toBe("Loading snake animation");
    expect(screen.get(".v-loader").attributes("aria-label")).toBe(
      "Loading snake animation",
    );
    expect(screen.get(".playground__template code").text()).toContain(
      'label="Loading snake animation"',
    );
  });

  it("removes the visible label when the input is cleared", async () => {
    const screen = await mountSuspended(LoaderPlayground, {
      props: { entry: spin },
    });

    await screen.get("#loader-label").setValue("");

    expect(screen.find(".playground__label").exists()).toBe(false);
    expect(screen.get(".v-loader").attributes("aria-hidden")).toBe("true");
    expect(screen.get(".playground__template code").text()).toContain('label=""');
  });

  it("keeps the visible label in decorative mode", async () => {
    const screen = await mountSuspended(LoaderPlayground, {
      props: { entry: spin },
    });

    await screen.get("#loader-decorative").setValue(true);

    expect(screen.get(".playground__label").text()).toBe("Loading content");
    expect(screen.get(".v-loader").attributes("aria-hidden")).toBe("true");
    expect(screen.get(".v-loader").attributes("role")).toBeUndefined();
    expect(screen.get(".playground__template code").text()).toContain("decorative");
  });

  it("keeps the visible label in step with the composition snippet", async () => {
    const screen = await mountSuspended(LoaderPlayground, {
      props: { entry: spin },
    });

    await screen.get("#loader-label").setValue("Loading snake animation");

    const compositionTab = screen
      .findAll('[role="tab"]')
      .find((tab) => tab.text().trim() === "Composition API");

    await compositionTab!.trigger("click");
    const panelId = compositionTab!.attributes("aria-controls");

    expect(screen.get(`#${panelId}`).text()).toContain(
      'const label = ref("Loading snake animation");',
    );
  });
});

describe("loader playground readiness", () => {
  it("renders the preview and the snippet on the server", async () => {
    const html = await renderOnServer(spin);

    expect(html).toContain("v-loader--spin");
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-label="Loading content"');
    expect(html).toContain("label=&quot;Loading content&quot;");
  });

  it("disables every control until the client application is mounted", async () => {
    const html = await renderOnServer(spin);

    const inputs = inputTags(html);

    expect(inputs.length).toBeGreaterThan(0);
    expect(
      inputs.every((tag) => tag.includes("disabled")),
      "every control is disabled before hydration",
    ).toBe(true);
    expect(html).toContain('id="loader-label"');
    expect(html).toContain('aria-busy="true"');
  });

  it("enables the controls once the component is mounted", async () => {
    const screen = await mountSuspended(LoaderPlayground, {
      props: { entry: spin },
    });

    const inputs = screen.findAll("input");

    expect(inputs.length).toBeGreaterThan(0);
    expect(
      inputs.every((input) => input.attributes("disabled") === undefined),
      "every control is enabled after hydration",
    ).toBe(true);
    expect(screen.get(".playground__controls").attributes("aria-busy")).toBeUndefined();
  });
});

describe("loader playground interaction after hydration", () => {
  it("updates the preview and the snippets when the label changes", async () => {
    const screen = await mountSuspended(LoaderPlayground, {
      props: { entry: spin },
    });

    await screen.get("#loader-label").setValue("Loading snake animation");

    const preview = screen.get(".v-loader");

    expect(preview.attributes("role")).toBe("status");
    expect(preview.attributes("aria-label")).toBe("Loading snake animation");
    expect(screen.get(".playground__template code").text()).toContain(
      'label="Loading snake animation"',
    );
  });

  it("hides the preview from assistive technology when it is decorative", async () => {
    const screen = await mountSuspended(LoaderPlayground, {
      props: { entry: spin },
    });

    await screen.get("#loader-decorative").setValue(true);

    const preview = screen.get(".v-loader");

    expect(preview.attributes("aria-hidden")).toBe("true");
    expect(preview.attributes("role")).toBeUndefined();
    expect(preview.attributes("aria-label")).toBeUndefined();
    expect(screen.get(".playground__template code").text()).toContain("decorative");
  });

  it("makes the preview decorative when the label is cleared", async () => {
    const screen = await mountSuspended(LoaderPlayground, {
      props: { entry: spin },
    });

    await screen.get("#loader-label").setValue("");

    const preview = screen.get(".v-loader");

    expect(preview.attributes("aria-hidden")).toBe("true");
    expect(preview.attributes("role")).toBeUndefined();
    expect(screen.get(".playground__template code").text()).toContain('label=""');
  });

  it("updates the preview and the snippets when the size changes", async () => {
    const screen = await mountSuspended(LoaderPlayground, {
      props: { entry: spin },
    });

    await screen.get("#loader-size").setValue(96);

    expect(screen.get(".v-loader").attributes("style")).toContain("--vl-size: 96px");
    expect(screen.get(".playground__template code").text()).toContain(':size="96"');
  });

  it("keeps the determinate value control in sync with the preview", async () => {
    const screen = await mountSuspended(LoaderPlayground, {
      props: { entry: ring },
    });

    expect(screen.find("#loader-value").exists()).toBe(false);

    await screen.get("#loader-determinate").setValue(true);

    expect(screen.get("#loader-value").exists()).toBe(true);
    expect(screen.get(".v-loader__value").text()).toBe("40%");
    expect(screen.get(".playground__template code").text()).toContain(':value="40"');
  });
});
