---
name: quasar-ssr-development
description: Build, configure, debug, test, and deploy server-side rendered Quasar applications. Use for Quasar SSR mode, hydration, universal code, SSR context, middleware, webserver selection, cookies, redirects, status codes, server-only dependencies, SEO, partial client-side rendering, SSR plus PWA, and `quasar dev` or `quasar build -m ssr` workflows.
---

# Quasar SSR Development

Use this skill with `quasar-development` for shared application concerns.

## Establish the SSR boundary

1. Inspect `quasar.config.* > ssr`, `src-ssr/`, boot files, routes, stores, and the selected webserver.
2. Read the current [Quasar SSR documentation](https://quasar.dev/quasar-cli-vite/developing-ssr/introduction).
3. Add the mode with `quasar mode add ssr`; honor the project's chosen webserver.
4. Run with `quasar dev -m ssr`; build with `quasar build -m ssr`.

## Write universal code

- Create request-scoped router, store, and mutable state. Never leak one request's data into another.
- Guard DOM, window, storage, and browser-only packages behind client execution.
- Keep server-only modules out of the client graph and secrets out of serialized state.
- Make initial server markup deterministic. Avoid time, randomness, locale, viewport, and client-storage differences during hydration.
- Use SSR context for request/response data, redirects, status codes, headers, and per-request metadata.
- Put server behavior in supported SSR middleware and webserver hooks.
- Evaluate third-party packages for SSR compatibility before importing them from universal modules.
- Use Quasar's partial CSR support intentionally for routes that do not need server rendering.

## Validate both halves

1. Test a direct HTTP request to every changed route in a production SSR build.
2. Confirm correct HTML, metadata, status codes, redirects, cookies, and headers before hydration.
3. Hydrate in a browser and check for mismatch warnings, duplicated requests, lost state, and event-handler failures.
4. Test concurrent requests when changing request-scoped state.
5. Run tests, typecheck, lint, and formatting checks; start the built server from `dist/ssr` as deployment will.
