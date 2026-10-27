import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import VLoading from "../components/VLoading/index.vue";
import VLoadingButton from "../components/VLoadingButton/index.vue";
import VProgress from "../components/VProgress/index.vue";
import VSkeleton from "../components/VSkeleton/index.vue";
import VSpinner from "../components/VSpinner/index.vue";

describe("server-side rendering", () => {
  it("renders every component without browser globals", async () => {
    const app = createSSRApp({
      render: () =>
        h("div", [
          h(VSpinner, { size: 20 }),
          h(VSkeleton, { variant: "rect", width: 120, height: 40 }),
          h(VProgress, { value: 40, label: "Upload" }),
          h(VLoading, { loading: true, label: "Loading" }, () =>
            h("p", "Content"),
          ),
          h(VLoadingButton, { loading: true, type: "submit" }, () =>
            "Saving",
          ),
        ]),
    });

    const html = await renderToString(app);

    expect(html).toContain('role="status"');
    expect(html).toContain("v-skeleton--rect");
    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-valuenow="40"');
    expect(html).toContain("v-loading__overlay");
    expect(html).toContain("inert");
    expect(html).toContain("v-loading-button");
    expect(html).toContain('aria-busy="true"');
  });
});
