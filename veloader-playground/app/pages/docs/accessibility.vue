<script setup lang="ts">
import AppBreadcrumbs from "~/components/AppBreadcrumbs.vue";
import CodeBlock from "~/components/CodeBlock.vue";
import PageIntro from "~/components/PageIntro.vue";
import {
  decorativeExample,
  loadingButtonExample,
  progressExample,
  reducedMotionExample,
  skeletonLabelExample,
} from "~/data/examples";

usePageSeo({
  title: "Accessibility",
  description:
    "How Veloader exposes loading states to assistive technology: status roles, live labels, decorative mode, reduced motion and keyboard behaviour.",
  path: "/docs/accessibility",
});
</script>

<template>
  <div class="container docs">
    <AppBreadcrumbs
      :items="[
        { label: 'Home', to: '/' },
        { label: 'Docs', to: '/docs/installation' },
        { label: 'Accessibility' },
      ]"
    />

    <PageIntro
      eyebrow="Guidance"
      title="Accessibility"
      lead="Loading states are announced, not just animated. Every Veloader component chooses a sensible role by default and lets you opt into silence when a parent region already reports the state."
    />

    <article class="docs__body prose">
      <h2>Roles and status semantics</h2>
      <ul>
        <li>
          <code>VLoader</code>, the named loaders and <code>VSpinner</code> render
          a <code>role="status"</code> region with an accessible name. Status
          regions are polite, so they never interrupt what a screen reader is
          currently saying.
        </li>
        <li>
          <code>VSkeleton</code>, <code>VPatternSkeleton</code> and the named
          skeleton presets are decorative by default. Add a
          <code>label</code> to turn them into a
          <code>role="status"</code> region with <code>aria-busy="true"</code>.
        </li>
        <li>
          <code>VProgress</code> renders <code>role="progressbar"</code> and
          exposes <code>aria-valuemin</code>,
          <code>aria-valuemax</code> and
          <code>aria-valuenow</code> only while the progress is determinate.
          An indeterminate bar never claims a percentage.
        </li>
        <li>
          <code>VLoading</code> sets <code>aria-busy</code> on its wrapper and
          announces its label through the overlay. The built-in spinner is
          decorative so the state is not announced twice.
        </li>
        <li>
          <code>VLoadingButton</code> exposes <code>aria-busy</code> while it
          works and relies on the native <code>disabled</code> attribute to
          prevent repeated activation. The label stays in the accessibility
          tree.
        </li>
      </ul>

      <h2>Decorative mode</h2>
      <p>
        A page can contain dozens of indicators. Announcing each of them would
        be noise, so use the decorative mode when a parent region already
        reports the state, for example inside a card that has its own
        <code>aria-busy</code> label.
      </p>

      <CodeBlock :code="decorativeExample" language="vue" label="Loaders" />
      <CodeBlock :code="skeletonLabelExample" language="vue" label="Skeletons" />

      <h2>Loading overlays and focus</h2>
      <p>
        <code>VLoading</code> makes the wrapped content
        <code>inert</code> while the overlay is visible. Content beneath the
        overlay can no longer receive pointer or keyboard focus, so keyboard
        users cannot tab into a region that is being replaced. The overlay
        itself is not focusable: it reports state, it does not accept input.
        Set <code>inert-content="false"</code> when the content must stay
        interactive while it refreshes.
      </p>

      <h2>Progress values</h2>
      <p>
        Only expose a percentage when you really know it. An indeterminate bar
        is a valid and often better answer than a fabricated one.
      </p>

      <CodeBlock :code="progressExample" language="vue" label="Progress" />

      <h2>Buttons</h2>
      <p>
        A loading button stays focusable and keeps its accessible name, so the
        user always knows which action is running.
      </p>

      <CodeBlock :code="loadingButtonExample" language="vue" label="Button" />

      <h2>Reduced motion</h2>
      <p>
        Every animation in the library is disabled or reduced under
        <code>prefers-reduced-motion: reduce</code>. The shimmer disappears,
        the loader animations stop and the progress bar falls back to a static
        fill. Align your own transitions with the same media query.
      </p>

      <CodeBlock :code="reducedMotionExample" language="ts" label="CSS" />

      <h2>Contrast</h2>
      <p>
        Indicators inherit <code>currentColor</code> by default, so they follow
        the contrast of the text around them. The skeleton base colour is
        decorative and never carries meaning on its own. When you override the
        colours, check them against the surface behind the placeholder and keep
        the ratio of meaningful text at or above 4.5:1.
      </p>

      <h2>Checklist</h2>
      <ul>
        <li>Give every indicator an accessible name, or make it decorative.</li>
        <li>Announce the result of a finished operation, not just its start.</li>
        <li>Keep focus inside the region that is being updated.</li>
        <li>Do not use a placeholder as the only indicator of an error.</li>
        <li>Test with a screen reader and with reduced motion enabled.</li>
      </ul>

      <p>
        The behaviour described here is covered by the library unit tests. No
        formal WCAG conformance audit has been carried out.
      </p>
    </article>
  </div>
</template>

<style scoped>
.docs {
  padding-bottom: 3rem;
}

.docs__body {
  max-width: var(--reading-width);
}

.docs__body :deep(h2) {
  scroll-margin-top: 5.5rem;
}

.docs__body :deep(.code-block) {
  margin-top: 1rem;
}
</style>
