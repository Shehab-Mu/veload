# Veloader

A Vue 3 + TypeScript loading toolkit and its Nuxt documentation playground,
kept together in one repository with separate project directories.

## Repository structure

| Directory | Purpose |
| --- | --- |
| [`pcakage/`](./pcakage/README.md) | The Vue library, its public components, composables, types, and package build configuration. |
| [`veloader-playground/`](./veloader-playground/README.md) | The Nuxt application that documents and demonstrates the actual library. |

`pcakage` is the existing library directory's spelling. It is intentionally
preserved: the playground depends on `file:../pcakage`, and its development
and build hooks refer to that path.

There is no root npm package or npm-workspaces configuration. Each project
has its own `package.json` and `package-lock.json`; retain both lockfiles.
See the linked READMEs for the project-specific development workflows.

## Separate release responsibilities

- Only the library is intended for npm publication. It is licensed under MIT
  and remains version `0.1.0`; it is not published until verified on npm.
  The first release requires an explicit publish operation by the maintainer.
- The playground is a separate application, not the npm package. It is
  deployed independently at [veloader-playground.vercel.app](https://veloader-playground.vercel.app).
- Generated library output and Nuxt output are not committed. Build the
  library before using its local package exports, following the project
  READMEs. No generated `dist` directory is expected in a fresh clone.
- No publishing, deployment, or automatic-merge workflow is configured here.

## Files intentionally kept local

At the owner's request, Git excludes test suites, test-only fixtures,
identified test-only runner scripts, and generated test artifacts. These
files are not deleted from the maintainer's workspace, but they are not
part of a GitHub clone. Package scripts and project READMEs may describe
local test commands that require those omitted files. The root ignore
policy does not remove build, TypeScript, Vite, Nuxt, or Vitest configuration.
Screenshot utilities and bundle-measurement tooling remain available.

Markdown files are excluded except README documents. The root README and
both project READMEs remain included. Dependency directories, generated
output, logs, local environment files, and private key material are also
excluded. `.env.example`, `.env.sample`, and `.env.template` may be committed
only when they contain placeholders or empty values, never credentials.
The existing playground example has an empty public-origin setting.

Ignoring a file does not erase it from existing commits. Review the staged
file list and scan for credentials before every upload. Keep secrets out of
source code, README examples, package-registry configuration, and URLs.

## GitHub access and branch protection

Keep the repository private until the owner explicitly approves a visibility
change. Do not grant collaborators, teams, applications, or automation write
access without the owner's authorization. A pull request proposes changes;
it does not grant its author permission to merge them.

Once the GitHub repository exists, configure and verify the settings the
account's plan supports:

1. Under **Settings → Collaborators** (or **Collaborators and teams**), retain
   owner-only write access unless the owner intentionally grants access.
2. Under **Settings → Rules → Rulesets**, create an active branch ruleset
   targeting `main`, or use **Settings → Branches** for classic protection.
   Require a pull request, block force pushes, and restrict branch deletion.
   Review bypass permissions so other users or apps cannot bypass the rule.
3. For a solo maintainer, require a pull request with **zero required
   approvals** unless a separate trusted reviewer is available. GitHub does
   not let an author approve their own pull request; requiring one approval
   can block the owner's normal merge workflow. Do not describe zero-review
   protection as independent review enforcement.
4. Under **Settings → General → Pull Requests**, leave **Allow auto-merge**
   disabled. Do not configure workflows to merge external pull requests.
5. Under **Settings → Actions → General → Workflow permissions**, use the
   read-only default and leave **Allow GitHub Actions to create and approve
   pull requests** disabled. Future workflows should declare only the
   permissions their individual jobs need.

Private-repository branch protection and rulesets depend on GitHub's current
account plan. If GitHub requires an upgrade, keep the repository private and
owner-only; do not switch visibility or claim the unavailable rules are
being enforced. Owner-only access prevents others from writing, but it is
not a substitute for an enforced rule against the owner's own force pushes.

This README records the intended policy. It is not evidence that remote
settings have been applied; inspect GitHub's actual settings after setup.
