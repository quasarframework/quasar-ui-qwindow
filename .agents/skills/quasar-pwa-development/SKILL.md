---
name: quasar-pwa-development
description: Build, configure, debug, test, and deploy Quasar Progressive Web Apps. Use for Quasar PWA mode, web app manifests, installability, service workers, Workbox GenerateSW or InjectManifest, offline behavior, caching, updates, push-related integration, icons, PWA with SSR or SSG, and `quasar dev` or `quasar build -m pwa` workflows.
---

# Quasar PWA Development

Use this skill with `quasar-development` and, when combined, the SSR or SSG skill.

## Choose the service-worker strategy

1. Inspect `quasar.config.* > pwa`, `src-pwa/`, manifest configuration, and current Workbox mode.
2. Read the current [Quasar PWA documentation](https://quasar.dev/quasar-cli-vite/developing-pwa/introduction).
3. Add the mode with `quasar mode add pwa`.
4. Prefer `GenerateSW` for standard caching; use `InjectManifest` only when custom service-worker logic is required.

## Design caching and updates explicitly

- Define what works offline and which requests must remain network-only.
- Never cache authentication responses, personalized data, mutation requests, or sensitive API content without a reviewed policy.
- Version application-shell and runtime caches; remove obsolete caches during activation.
- Provide an update flow appropriate to the app. Do not force activation when it can discard unsaved user work.
- Keep manifest identity, scope, start URL, display mode, theme colors, and icons aligned with deployment.
- Remember service workers require a secure context except on localhost.
- Test development behavior only where Quasar enables PWA service-worker handling; production output is authoritative.

## Validate

1. Build with `quasar build -m pwa` and serve the output over HTTPS or localhost.
2. Verify manifest and service-worker registration in browser developer tools.
3. Test first load, reload, offline launch, network recovery, a deployed update, and cache cleanup.
4. Audit installability, icons, scope, start URL, routing fallbacks, and storage use.
5. Run tests, typecheck, lint, and formatting checks.
