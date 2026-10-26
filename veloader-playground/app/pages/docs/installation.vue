<script setup lang="ts">
import AppBreadcrumbs from "~/components/AppBreadcrumbs.vue";
import CodeBlock from "~/components/CodeBlock.vue";
import PageIntro from "~/components/PageIntro.vue";
import {
  exportedTypes,
  firstUse,
  globalRegistration,
  installAfterRelease,
  namedImports,
  nuxtSsrUse,
  nuxtStylesheet,
  viteStylesheet,
} from "~/data/examples";

usePageSeo({
  title: "Installation",
  description:
    "Veloader release status and post-release setup: Vue ^3.5.2, named exports, styles, TypeScript and server-rendered Nuxt usage.",
  path: "/docs/installation",
});
</script>

<template>
  <div class="container docs">
    <AppBreadcrumbs
      :items="[
        { label: 'Home', to: '/' },
        { label: 'Docs', to: '/docs/installation' },
        { label: 'Installation' },
      ]"
    />

    <PageIntro
      eyebrow="Getting started"
      title="Installation"
      lead="Veloader is a plain Vue 3 package licensed under MIT. It is not yet published to npm; this guide describes the consumer workflow for its first verified public release."
    />

    <div class="docs__layout">
      <article class="docs__body prose">
        <h2 id="requirements">Requirements</h2>
        <ul>
          <li>
            Vue <code>^3.5.2</code> as a peer dependency: Vue 3.5.2 or a later
            compatible Vue 3 release, not Vue 4. The declarations use Vue 3.5
            types; Vue 3.0–3.4 are outside the supported peer range.
          </li>
          <li>
            A Vue application build tool, such as Vite with its Vue plugin or
            Nuxt. The package ships compiled JavaScript and TypeScript
            declarations; consumers do not compile its source SFCs.
          </li>
          <li>
            A browser with CSS custom properties, <code>color-mix()</code> and
            <code>:has()</code> for the full loader collection.
          </li>
        </ul>

        <h2 id="install-the-package">Install the package</h2>
        <p>
          <strong>Not published to npm yet.</strong> The library is licensed
          under MIT, but package installation is available only after the
          package name and first public release are verified on npm.
        </p>
        <p>
          <strong>After the first public release is verified</strong>, install
          the package in your Vue application:
        </p>

        <CodeBlock
          :code="installAfterRelease"
          language="bash"
          label="Terminal · after public release"
        />

        <p>
          Repository contributors should follow the separate local workflow in
          the playground README. Local build, linking and tarball commands are
          not prerequisites for future public-package consumers.
        </p>

        <h2 id="register-the-stylesheet">Register the stylesheet</h2>
        <p>
          Component styles are extracted into a single
          <code>veload/style.css</code> file. Import it once, globally. The
          JavaScript entry point does not inject styles automatically, so
          without this import the components render without their intended
          appearance and animations.
        </p>

        <CodeBlock :code="nuxtStylesheet" language="ts" label="Nuxt" />
        <CodeBlock :code="viteStylesheet" language="ts" label="Vite" />

        <h2 id="import-the-components">Import the components</h2>
        <p>
          Every component and composable is a named export from
          <code>veload</code>. The root entry provides ESM, CommonJS and
          <code>dist/index.d.ts</code> declarations. Use the public package
          entry rather than importing private source or <code>dist</code>
          paths. There is no default plugin, Nuxt module or global loading
          manager. Import only what you use so the bundler can drop unused
          JavaScript; the stylesheet still includes every component.
        </p>

        <CodeBlock :code="namedImports" language="ts" label="Imports" />

        <h2 id="first-use">First use</h2>
        <p>
          In a Vue single-file component, <code>&lt;script setup&gt;</code>
          imports are available directly in the template; no registration step
          is needed. This example starts a request only on a button click and
          handles errors in the application. Supply your own
          <code>/api/message</code> endpoint returning a JSON string; the
          library does not provide it or perform requests automatically.
        </p>

        <CodeBlock :code="firstUse" language="vue" label="Example.vue" />

        <h2 id="optional-registration">Optional registration</h2>
        <p>
          Prefer SFC imports. In an Options API component, use
          <code>components: { VSpinner }</code> after importing it. If your app
          intentionally uses global components, register individual named
          exports with Vue's <code>app.component()</code>, not
          <code>app.use(Veloader)</code>:
        </p>

        <CodeBlock :code="globalRegistration" language="ts" label="main.ts · optional" />

        <p>
          Runtime global registration does not add template types automatically.
          Prefer local imports for type inference, or declare Vue's
          <code>GlobalComponents</code> types in your app when using global
          components with a template type checker.
        </p>

        <h2 id="typescript">TypeScript</h2>
        <p>
          Prop types, loader variants and composable return types are exported
          from the package root. Declarations are included through the
          <code>types</code> export; no separate types package or shim is
          needed. Use <code>import type</code> for type-only imports and a
          Vue-aware checker such as <code>vue-tsc</code> (or Nuxt's
          <code>nuxt typecheck</code>) to check SFC templates.
        </p>

        <CodeBlock :code="exportedTypes" language="ts" label="Types" />

        <h2 id="nuxt-ssr">Nuxt and server rendering</h2>
        <p>
          Register <code>veload/style.css</code> in the Nuxt
          <code>css</code> option above, then import components directly in
          page or component SFCs. The library can render on the server; no
          client-only plugin or <code>ClientOnly</code> wrapper is required.
        </p>
        <p>
          For initial server-fetched data, use Nuxt's
          <code>useFetch</code> or <code>useAsyncData</code> so its payload is
          reused during hydration instead of issuing a second request. This
          example uses the same application-owned endpoint:
        </p>

        <CodeBlock :code="nuxtSsrUse" language="vue" label="pages/message.vue · Nuxt" />

        <p>
          Create <code>useLoading()</code> and
          <code>useDelayedLoading()</code> inside component setup, not at
          module scope where mutable state could be shared between SSR
          requests. Use them for user-triggered work; they track activity,
          not Nuxt data fetching or payload serialization. Keep browser-only
          work in event handlers or <code>onMounted</code>, and use the same
          initial loading state on the server and client to avoid hydration
          mismatches.
        </p>
      </article>

      <aside class="docs__aside">
        <nav class="docs__toc card" aria-label="On this page">
          <p class="docs__toc-title">On this page</p>
          <ul>
            <li><a href="#requirements">Requirements</a></li>
            <li><a href="#install-the-package">Install the package</a></li>
            <li><a href="#register-the-stylesheet">Register the stylesheet</a></li>
            <li><a href="#import-the-components">Import the components</a></li>
            <li><a href="#first-use">First use</a></li>
            <li><a href="#optional-registration">Optional registration</a></li>
            <li><a href="#typescript">TypeScript</a></li>
            <li><a href="#nuxt-ssr">Nuxt and SSR</a></li>
          </ul>
        </nav>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.docs {
  padding-bottom: 3rem;
}

.docs__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 15rem;
  gap: 2.5rem;
  align-items: start;
  padding-top: 1rem;
}

.docs__layout > * {
  min-width: 0;
}

.docs__body :deep(h2) {
  scroll-margin-top: 5.5rem;
}

.docs__body :deep(.code-block) {
  margin-top: 1rem;
}

.docs__toc {
  position: sticky;
  top: 5.5rem;
  padding: 1rem 1.15rem;
}

.docs__toc-title {
  color: var(--text-subtle);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.docs__toc ul {
  display: grid;
  gap: 0.45rem;
  margin-top: 0.8rem;
}

.docs__toc a {
  color: var(--text-muted);
  font-size: 0.85rem;
  text-decoration: none;
}

.docs__toc a:hover {
  color: var(--accent-strong);
  text-decoration: underline;
}

@media (max-width: 60rem) {
  .docs__layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .docs__aside {
    order: -1;
  }

  .docs__toc {
    position: static;
  }
}
</style>
