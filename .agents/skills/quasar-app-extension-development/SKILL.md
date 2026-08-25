---
name: quasar-app-extension-development
description: Create, debug, test, migrate, document, and publish Quasar App Extensions. Use for extension scaffolding, `src/index` lifecycle hooks, Install API, Prompts API, templates, boot files, commands, mode integration, package metadata, compatibility declarations, uninstall behavior, and `quasar ext add`, `invoke`, and `remove` workflows.
---

# Quasar App Extension Development

## Inspect the extension

1. Read repository instructions, `package.json`, extension README, `src/index.*`, `src/install.*`, and `src/prompts.*` when present.
2. Determine supported Quasar CLI generations and module format before changing APIs.
3. Inspect templates, test applications, CI, release scripts, and the extension's package name and `quasarAppExtension` metadata.
4. Use the current [App Extension development guide](https://quasar.dev/app-extensions/development-guide/introduction) as the contract.

## Implement lifecycle behavior

- Keep `install`, `prompts`, `index`, and `uninstall` responsibilities separate.
- Make install/invoke operations idempotent and uninstall operations conservative.
- Use the API's resolve helpers rather than constructing host paths manually.
- Extend host configuration through supported hooks; preserve the host app's existing configuration.
- Use `api.compatibleWith()` for real compatibility constraints and keep declared peer dependencies aligned.
- Limit mode-specific behavior with `api.ctx.mode` and load the corresponding Quasar mode skill.
- Never silently overwrite user-owned host files. Use templates and API helpers, and document unavoidable conflicts.
- Avoid deprecated `chainWebpack` assumptions in Vite extensions; use the current configuration hooks exposed by the installed CLI.

## Package and document

- Keep runtime dependencies, development dependencies, and peer dependencies in their correct scopes.
- Include only files needed by consumers in the published package.
- Document install, configuration, injected files, commands, supported modes, compatibility, and removal effects.
- Treat the generated host `.quasar/` directory as output.

## Validate the full lifecycle

1. Pack the extension and install the tarball into a temporary Quasar test app.
2. Run `quasar ext add <name>` and answer prompts through each meaningful branch.
3. Run development and production builds for every supported mode.
4. Run `quasar ext invoke <name>` again to verify idempotency and upgrades.
5. Run `quasar ext remove <name>` and confirm user-owned files and configuration remain valid.
6. Run lint, tests, typecheck, package-content inspection, and a clean-install test before release.
