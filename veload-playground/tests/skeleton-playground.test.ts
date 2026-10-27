import { describe, expect, it } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { createSSRApp } from "vue";
import { renderToString } from "vue/server-renderer";
import SkeletonPlayground from "~/components/SkeletonPlayground.vue";
import { findSkeletonPreset } from "~/data/catalog";

const card = findSkeletonPreset("card-skeleton")!;

const inputTags = (html: string): string[] => html.match(/<input[^>]*>/g) ?? [];

/**
 * Renders the playground on the server. `onMounted` never runs here, so the
 * result is the markup a visitor receives before the client application
 * hydrates.
 */
const renderOnServer = (entry: typeof card): Promise<string> =>
  renderToString(createSSRApp(SkeletonPlayground, { entry }));

describe("skeleton playground colour pickers", () => {
  it("keeps the library defaults in the text inputs and shows them in the pickers", async () => {
    const screen = await mountSuspended(SkeletonPlayground, {
      props: { entry: card },
    });

    expect(screen.get("#skeleton-color").element.value).toBe("");
    expect(screen.get("#skeleton-highlight").element.value).toBe("");
    expect(screen.get("#skeleton-color-picker").element.value).toBe("#94a3b8");
    expect(screen.get("#skeleton-highlight-picker").element.value).toBe("#ffffff");
  });

  it("updates the preview and the snippet from the base colour picker", async () => {
    const screen = await mountSuspended(SkeletonPlayground, {
      props: { entry: card },
    });

    await screen.get("#skeleton-color-picker").setValue("#ff0000");

    expect(screen.get("#skeleton-color").element.value).toBe("#ff0000");
    expect(screen.get(".v-pattern-skeleton").attributes("style")).toContain(
      "--v-skeleton-base-color: #ff0000",
    );
    expect(screen.get(".playground__template code").text()).toContain(
      'color="#ff0000"',
    );
  });

  it("updates the preview and the snippet from the highlight colour picker", async () => {
    const screen = await mountSuspended(SkeletonPlayground, {
      props: { entry: card },
    });

    await screen.get("#skeleton-highlight-picker").setValue("#00ff00");

    expect(screen.get("#skeleton-highlight").element.value).toBe("#00ff00");
    expect(screen.get(".v-pattern-skeleton").attributes("style")).toContain(
      "--v-skeleton-highlight-color: #00ff00",
    );
    expect(screen.get(".playground__template code").text()).toContain(
      'highlightColor="#00ff00"',
    );
  });

  it("keeps the alpha of a typed rgba value", async () => {
    const screen = await mountSuspended(SkeletonPlayground, {
      props: { entry: card },
    });

    await screen.get("#skeleton-color").setValue("rgba(148, 163, 184, 0.28)");

    expect(screen.get("#skeleton-color").element.value).toBe(
      "rgba(148, 163, 184, 0.28)",
    );
    expect(screen.get(".v-pattern-skeleton").attributes("style")).toContain(
      "--v-skeleton-base-color: rgba(148, 163, 184, 0.28)",
    );
    expect(screen.get(".playground__template code").text()).toContain(
      'color="rgba(148, 163, 184, 0.28)"',
    );
    // The picker cannot show the transparency, so it keeps its own value.
    expect(screen.get("#skeleton-color-picker").element.value).toBe("#94a3b8");
    expect(screen.get("#skeleton-color-hint").text()).toContain(
      "the rgba value is kept",
    );
  });

  it("synchronises the picker with a typed hexadecimal colour", async () => {
    const screen = await mountSuspended(SkeletonPlayground, {
      props: { entry: card },
    });

    await screen.get("#skeleton-color").setValue("#123456");

    expect(screen.get("#skeleton-color-picker").element.value).toBe("#123456");
    expect(screen.get(".v-pattern-skeleton").attributes("style")).toContain(
      "--v-skeleton-base-color: #123456",
    );
  });

  it("does not overwrite a value the picker cannot represent", async () => {
    const screen = await mountSuspended(SkeletonPlayground, {
      props: { entry: card },
    });

    await screen.get("#skeleton-highlight").setValue("rebeccapurple");

    expect(screen.get("#skeleton-highlight").element.value).toBe("rebeccapurple");
    expect(screen.get("#skeleton-highlight-picker").element.value).toBe("#ffffff");
    expect(screen.get(".v-pattern-skeleton").attributes("style")).toContain(
      "--v-skeleton-highlight-color: rebeccapurple",
    );
  });
});

describe("skeleton playground readiness", () => {
  it("renders the preview and the snippet on the server", async () => {
    const html = await renderOnServer(card);

    expect(html).toContain("v-pattern-skeleton--card");
    expect(html).toContain("v-skeleton");
    expect(html).toContain("&lt;VCardSkeleton");
  });

  it("disables every control until the client application is mounted", async () => {
    const html = await renderOnServer(card);

    const inputs = inputTags(html);

    expect(inputs.length).toBeGreaterThan(0);
    expect(
      inputs.every((tag) => tag.includes("disabled")),
      "every control is disabled before hydration",
    ).toBe(true);
    expect(html).toContain('id="skeleton-label"');
    expect(html).toContain('id="skeleton-show-media"');
    expect(html).toContain('aria-busy="true"');
  });

  it("enables the controls once the component is mounted", async () => {
    const screen = await mountSuspended(SkeletonPlayground, {
      props: { entry: card },
    });

    const inputs = screen.findAll("input");

    expect(inputs.length).toBeGreaterThan(0);
    expect(
      inputs.every((input) => input.attributes("disabled") === undefined),
      "every control is enabled after hydration",
    ).toBe(true);
    expect(
      screen.get(".playground__controls").attributes("aria-busy"),
    ).toBeUndefined();
  });
});

describe("skeleton playground interaction after hydration", () => {
  it("updates the preview and the snippet when the rows change", async () => {
    const screen = await mountSuspended(SkeletonPlayground, {
      props: { entry: card },
    });

    const before = screen.findAll(".v-skeleton--text").length;

    await screen.get("#skeleton-rows").setValue(5);

    expect(screen.findAll(".v-skeleton--text").length).toBeGreaterThan(before);
    expect(screen.get(".playground__template code").text()).toContain(':rows="5"');
  });

  it("exposes the preview as a labelled status when a label is set", async () => {
    const screen = await mountSuspended(SkeletonPlayground, {
      props: { entry: card },
    });

    const preview = screen.get(".v-pattern-skeleton");

    expect(preview.attributes("aria-hidden")).toBe("true");
    expect(preview.attributes("role")).toBeUndefined();

    await screen.get("#skeleton-label").setValue("Loading card");

    expect(preview.attributes("role")).toBe("status");
    expect(preview.attributes("aria-label")).toBe("Loading card");
    expect(preview.attributes("aria-hidden")).toBeUndefined();
    expect(screen.get(".playground__template code").text()).toContain(
      'label="Loading card"',
    );
  });

  it("keeps the preview decorative when the label is cleared again", async () => {
    const screen = await mountSuspended(SkeletonPlayground, {
      props: { entry: card },
    });

    await screen.get("#skeleton-label").setValue("Loading card");
    await screen.get("#skeleton-label").setValue("");

    const preview = screen.get(".v-pattern-skeleton");

    expect(preview.attributes("aria-hidden")).toBe("true");
    expect(preview.attributes("role")).toBeUndefined();
    expect(screen.get(".playground__template code").text()).toContain(
      "<VCardSkeleton />",
    );
  });

  it("removes a block from the preview and the snippet when it is switched off", async () => {
    const screen = await mountSuspended(SkeletonPlayground, {
      props: { entry: card },
    });

    expect(screen.findAll(".v-skeleton--rect").length).toBe(1);

    await screen.get("#skeleton-show-media").setValue(false);

    expect(screen.findAll(".v-skeleton--rect").length).toBe(0);
    expect(screen.get(".playground__template code").text()).toContain(
      ':showMedia="false"',
    );
  });

  it("applies a custom media height to the preview and the snippet", async () => {
    const screen = await mountSuspended(SkeletonPlayground, {
      props: { entry: card },
    });

    await screen.get("#skeleton-media").setValue("12rem");

    expect(screen.get(".playground__template code").text()).toContain(
      'mediaHeight="12rem"',
    );
  });
});
