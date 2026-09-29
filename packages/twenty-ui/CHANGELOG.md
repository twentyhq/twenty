# Changelog

## [Unreleased]

### Breaking Changes

- `ProgressBar` no longer accepts `countdownDurationInMs`, `isCountdownPaused`, or `onCountdownComplete`. Notification countdowns belong to `Toast`. Its duration, hover pause, manual progress, and close behavior are preserved, and keyboard focus now also pauses the countdown. The desktop companion uses the shared Toast.
- `Card` is now a compound component. Import `Card` from `twenty-ui/primitives/surfaces`, replace `<Card>` with `<Card.Root>`, and replace the removed `CardHeader`, `CardContent`, and `CardFooter` exports with `Card.Header`, `Card.Content`, and `Card.Footer`. Use `Card.Root` in styled wrappers and prop types. Rendering, styling, props, and independent use of the parts are unchanged. See the [Card migration guide](https://docs.twenty.com/ui/primitives/surfaces/card#migration).
- The in-repo Slack app still uses the separately versioned `twenty-ui@^1.0.0-alpha.1` package. Migrate its `twenty-ui/surfaces` import and `<Card>` usage together with its UI dependency upgrade; that published version does not expose `Card.Root`.
- Removed the unused `useScreenSize` export. `useIsMobile` and `useIsTouchDevice` remain available from `twenty-ui/utilities` and now subscribe to native `matchMedia` changes. Both return `false` during server rendering, initial hydration, and when `matchMedia` is unavailable. `react-responsive` context overrides no longer affect these hooks; use `overrideMediaQueryMatches` from `twenty-ui/testing` to force a result in stories.
- All theme exports now live in `twenty-ui/theme`. The `twenty-ui/theme-constants` entry, `ThemeContext`, `ThemeScopeContext`, and `ThemeContextType` are removed. Read values with `useTheme`, `useThemeColorScheme`, and `useThemeContainer`; configure them with `ThemeProvider`. The top-level theme stylesheet URLs and token values are unchanged.
- Worker apps retain provider-less CSS-variable values. Apps that supplied a context value can pass `THEME_LIGHT` or `THEME_DARK` directly through `ThemeProvider`'s `theme` prop. The in-repo call-recorder, companion, fireflies, Granola, Slack, and Teams apps import `twenty-ui/theme-constants` and must move those imports to `twenty-ui/theme` when they upgrade; call-recorder and Granola must also replace their `ThemeContext` providers with the `theme` prop. Their current pinned UI versions expose neither, so each app needs a coordinated source and dependency upgrade.
- `twenty-ui/testing` no longer exports `RouterDecorator`, `ComponentWithRouterDecorator`, `RouteParams`, `isRouteParams`, or `computeLocation`. Use application-owned router decorators when routing is needed, or `ComponentDecorator` for router-free stories. React Router is no longer a peer dependency.
- `ResizeHandle` owns pointer and keyboard resizing through `value`/`onValueChange` or `defaultValue`, with configurable `min`, `max`, and `step`. The public `useResizeHandle` hook is removed.
- **Public module ownership changes without a deprecation window.** This release removes 55 public React exports and the `twenty-ui/primitives/json-visualizer` entry point. Applications using the removed imports must migrate when upgrading; compatibility exports are not provided.
- Import shared compositions, including `JsonTree`, menu presets, and Toast components and hooks, from `twenty-ui/components`. Foundational controls retain `twenty-ui/primitives/<family>` imports. The optional code editor retains `twenty-ui/components/code-editor`.
- Field displays, application links, placeholders, and feature animations are no longer package exports. External applications must own these integrations or compose supported primitives. Internal implementation parts are private.
- `Info` uses `href` and `render` in place of `to`. Replace `AnimatedEaseInOut` and `AnimatedExpandableContainer` with `Collapsible`. Remove the unused `mode` and `initial` props.
- `SegmentedControl` is a radio group. Use `aria-label` or `aria-labelledby` (one is required), `value` or `defaultValue`, and `onValueChange(value, eventDetails)` in place of `ariaLabel`, `value`, and `onChange(value)`. Options take `startIcon` and `'aria-label'` in place of `Icon` and `ariaLabel`. `role` and `width` are removed: use `Tabs` for tab lists and `className` or `style` to size the control. Arrow keys select the next option, Enter no longer selects, and choosing the selected option again no longer calls `onValueChange`.
- Dropdown submenu arrow keys follow `TextDirectionProvider` instead of the computed CSS direction. RTL content set only through `dir` or `direction` now uses LTR keys; wrap it in `TextDirectionProvider`. A Base UI `DirectionProvider` on its own no longer sets `dir` on Select, Dialog, AlertDialog, or Toaster portals; use `TextDirectionProvider`.
- `Dropdown.Header` and `Dropdown.Back` no longer rotate caller-supplied icons in RTL. Pass an icon that already points the intended way.

Keep `twenty-ui`, `twenty-sdk`, and `twenty-client-sdk` versions aligned when upgrading Twenty apps.

### Fixed

- Reading-direction spacing, JSON disclosure arrows, theme picker corners, avatar overlap, and the Dropdown Back chevron now follow RTL layouts. Menu, Popover, Tooltip, Select, Dialog, AlertDialog, and Toaster portals set the `TextDirectionProvider` direction as `dir`, and inherit their container's direction when no provider is present. Pair the provider with the matching HTML `dir` attribute.

### Added

- `Callout.closeLabel` customizes the dismiss button name. `ListItem`, `Menu` items, and `Dropdown` items accept `hotkeysJoinLabel` (default `then`); the legacy `MenuItem` uses `hotKeysJoinLabel`. `ColorSchemePicker` uses its supplied visible labels as accessible names.

- `twenty-ui/utilities` exports `useMediaQuery`, `MOBILE_MEDIA_QUERY`, and `TOUCH_DEVICE_MEDIA_QUERY`. `twenty-ui/testing` exports `overrideMediaQueryMatches`.

### Fixed

- `getUserDevice()` returns `unknown` without a user agent, so device and shortcut helpers work without browser globals. It detects iPhone, iPad and Android user agents as `ios` and `android` instead of `mac` and `linux`; shortcut helpers keep `⌘` on iOS.
