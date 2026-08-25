---
name: quasar-spa-development
description: Build, configure, debug, optimize, and deploy Quasar single-page applications. Use for Quasar SPA mode, history or hash routing, public paths, client-only boot behavior, static hosting, code splitting, fallback rewrites, and `quasar dev` or `quasar build -m spa` workflows.
---

# Quasar SPA Development

Use this skill with `quasar-development` for shared application concerns.

## Work in SPA mode

1. Inspect `quasar.config.*`, router history mode, `build.publicPath`, boot files, and deployment target.
2. Read the current [Quasar SPA documentation](https://quasar.dev/quasar-cli-vite/developing-spa/introduction).
3. Add SPA mode explicitly only when needed: `quasar mode add spa`.
4. Run locally with `quasar dev -m spa`; build with `quasar build -m spa`.

## Preserve deployment invariants

- Configure the web server to serve `index.html` for unknown client-side routes when using history routing.
- Use hash routing when the host cannot provide fallback rewrites and the URL tradeoff is acceptable.
- Align router history, `publicPath`, asset URLs, and the deployment subdirectory.
- Do not place secrets in client code or build-time client environment variables.
- Lazy-load routes and substantial features; measure bundle output before adding manual chunking.
- Keep offline behavior in PWA mode rather than building an ad hoc service worker into SPA mode.

## Validate

1. Test direct navigation and refresh on a nested route.
2. Build production output and serve it under the intended base path.
3. Verify asset URLs, redirects, error handling, chunk loading, and browser console output.
4. Run repository tests, typecheck, lint, and formatting checks.
