---
name: quasar-ssg-development
description: Build, configure, debug, optimize, and deploy statically generated Quasar sites. Use for Quasar SSG mode, route discovery, rendering, SEO, dynamic routes, 404 pages, static hosting, partial client-side rendering, SSG plus PWA, universal-code caveats, and `quasar dev` or `quasar build -m ssg` workflows.
---

# Quasar SSG Development

Use this skill with `quasar-development`; apply SSR-safe coding practices during generation.

## Configure generation

1. Inspect `quasar.config.* > ssg`, `src-ssg/`, router definitions, data sources, and deployment target.
2. Read the current [Quasar SSG documentation](https://quasar.dev/quasar-cli-vite/developing-ssg/introduction).
3. Add the mode with `quasar mode add ssg`.
4. Run with `quasar dev -m ssg`; generate with `quasar build -m ssg`.

## Make output complete and deterministic

- Ensure every public dynamic route is discoverable by the SSG renderer or supplied explicitly.
- Fetch build-time content deterministically and fail clearly when required content cannot be generated.
- Avoid browser globals while rendering; delay client-only integrations until hydration.
- Generate canonical URLs, titles, descriptions, social metadata, and structured data per route.
- Configure the base/public path for the final host.
- Provide and verify the generated 404 strategy supported by the target host.
- Use hybrid partial CSR only for routes that cannot or should not be generated.
- Treat build-time credentials as secrets and ensure they never appear in emitted HTML or JavaScript.

## Validate the generated site

1. Inspect the output for all expected route files and metadata.
2. Serve the production output from a static server at the intended base path.
3. Test direct navigation, refresh, hydration, internal links, asset paths, and the 404 page.
4. Check for broken links and accidental secret or private-data serialization.
5. Run tests, typecheck, lint, and formatting checks.
