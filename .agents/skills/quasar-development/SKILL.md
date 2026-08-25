---
name: quasar-development
description: Build, debug, test, and maintain Quasar Framework applications using Vue 3 and Quasar CLI with Vite. Use for Quasar components, composables, plugins, boot files, routing, state management, layouts, forms, theming, configuration, TypeScript, accessibility, testing, builds, dependency updates, and general Quasar application architecture. Pair with a mode-specific Quasar skill for SPA, SSR, SSG, PWA, Capacitor, Cordova, Electron, or BEX work.
---

# Quasar Development

## Establish the project context

1. Read repository instructions and the root `package.json` before editing.
2. Detect the package manager from its lockfile and use it consistently.
3. Inspect `quasar.config.*`, the `@quasar/app-vite` version, enabled boot files, router, store, and active mode.
4. Preserve existing conventions and unrelated work. Do not replace Quasar CLI configuration with raw Vite configuration.
5. Consult the [Quasar documentation](https://quasar.dev/) and the installed package types before assuming an API or configuration field.

## Implement with Quasar conventions

- Prefer Quasar components, directives, plugins, CSS variables, Sass variables, and utilities when they satisfy the requirement.
- Import Quasar plugins used outside templates and register/configure them through `quasar.config.*` when required.
- Put application startup integrations in boot files; respect their client/server execution context.
- Use layouts and `router-view` for page shells. Keep route definitions lazy unless eager loading is intentional.
- Use `process.env.CLIENT`, `process.env.SERVER`, and mode flags only where Quasar exposes them; avoid direct browser globals in universal code.
- Preserve tree shaking. Do not import all of Quasar or manually register components in a CLI project without a demonstrated need.
- Keep accessibility semantics, keyboard interaction, focus behavior, reduced motion, dark mode, and responsive layouts intact.
- Treat generated `.quasar/` and `dist/` content as disposable output; never edit or commit it.

## Configure safely

- Make changes through `defineConfig()` in `quasar.config.*`.
- Distinguish build-time configuration from runtime application state.
- Use `build.env` deliberately; never expose server secrets to client bundles.
- Extend bundler configuration through the supported Quasar hooks and preserve existing aliases/plugins.
- Run `quasar prepare` after configuration or dependency changes when generated types may be stale.

## Validate

1. Run the narrowest relevant unit or component tests.
2. Run the repository's typecheck, lint, and formatting checks.
3. Build the affected Quasar mode, not only the default SPA mode.
4. Exercise the changed behavior in development when it depends on routing, boot order, browser APIs, or HMR.
5. Check the final diff for generated output, secrets, unrelated formatting, and lockfile churn.

## Route specialized work

Load the matching mode skill for platform-specific configuration and validation. Load `quasar-app-extension-development` for `src/index.*`, Install API, Prompts API, templates, and extension lifecycle work.
