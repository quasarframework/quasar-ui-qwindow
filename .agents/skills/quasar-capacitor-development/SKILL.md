---
name: quasar-capacitor-development
description: Build, configure, debug, test, and release Quasar mobile applications using Capacitor for Android and iOS. Use for Quasar Capacitor mode, native projects, Capacitor plugins, permissions, deep links, app lifecycle, device testing, icons and splash screens, signing, stores, live updates, and `quasar dev` or `quasar build -m capacitor` workflows.
---

# Quasar Capacitor Development

Use this skill with `quasar-development` for shared UI and application concerns.

## Respect the native boundary

1. Inspect `quasar.config.* > capacitor`, `src-capacitor/`, Capacitor config, native platforms, plugins, and supported OS versions.
2. Read the current [Quasar Capacitor documentation](https://quasar.dev/quasar-cli-vite/developing-capacitor-apps/introduction) and the installed Capacitor/plugin documentation.
3. Add the mode with `quasar mode add capacitor`.
4. Keep web dependencies in the app root and Capacitor/native dependencies where the generated mode structure expects them.

## Implement device behavior safely

- Use maintained Capacitor plugins and verify their version compatibility with the installed Capacitor major.
- Request permissions at the point of use and handle denied, restricted, and permanently denied states.
- Handle pause, resume, back button, keyboard, status bar, safe areas, deep links, and network changes deliberately.
- Validate external URLs and untrusted data crossing plugin boundaries.
- Keep signing material, API secrets, and store credentials out of source control and client bundles.
- Make manual native-project changes reproducible and document why they cannot live in configuration.
- Use live updates only with a reviewed rollback, integrity, compatibility, and store-policy strategy.

## Validate on real platforms

1. Run `quasar dev -m capacitor -T android` or `-T ios` as appropriate.
2. Test changed native behavior on a real device when it involves permissions, lifecycle, hardware, deep links, or release signing.
3. Build with `quasar build -m capacitor -T <target>` and open the native project for final packaging.
4. Test fresh install, upgrade, background/resume, offline behavior, rotation, safe areas, and denied permissions.
5. Run web tests, typecheck, lint, formatting, and native platform checks.
