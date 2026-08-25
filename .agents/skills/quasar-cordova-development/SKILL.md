---
name: quasar-cordova-development
description: Build, configure, debug, test, and release Quasar mobile applications using Cordova for Android and iOS. Use for Quasar Cordova mode, Cordova plugins, `config.xml`, permissions, device APIs, lifecycle behavior, icons and splash screens, signing, stores, and `quasar dev` or `quasar build -m cordova` workflows.
---

# Quasar Cordova Development

Use this skill with `quasar-development` for shared UI and application concerns.

## Inspect the Cordova project

1. Inspect `quasar.config.* > cordova`, `src-cordova/config.xml`, installed platforms/plugins, and supported OS versions.
2. Read the current [Quasar Cordova documentation](https://quasar.dev/quasar-cli-vite/developing-cordova-apps/introduction) and installed plugin documentation.
3. Verify the required Cordova CLI and native toolchains before adding the mode with `quasar mode add cordova`.
4. Treat generated platform directories according to the project's source-control policy.

## Work across web and native layers

- Wait for `deviceready` before calling Cordova APIs.
- Verify plugin maintenance, platform support, variables, permissions, and native SDK compatibility before installation.
- Request permissions only when needed and handle denial paths.
- Handle pause, resume, back button, deep links, network changes, safe areas, and external navigation explicitly.
- Validate data crossing plugin/native boundaries and restrict navigation/allowlists appropriately.
- Keep signing keys, passwords, and secrets out of source control and web bundles.
- Record reproducible configuration in `config.xml`, hooks, or documented build steps rather than opaque platform edits.

## Validate

1. Run `quasar dev -m cordova -T android` or `-T ios` as appropriate.
2. Test plugin and lifecycle changes on a real device.
3. Build with `quasar build -m cordova -T <target>` and verify signed release artifacts separately.
4. Test fresh install, upgrade, permissions, background/resume, offline behavior, and external navigation.
5. Run web tests, typecheck, lint, formatting, and native platform checks.
