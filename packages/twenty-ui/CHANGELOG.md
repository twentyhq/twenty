# Changelog

## [Unreleased]

### Breaking Changes

- All theme exports now live in `twenty-ui/theme`. The `twenty-ui/theme-constants` entry, `ThemeContext`, `ThemeScopeContext`, and `ThemeContextType` are removed. Read values with `useTheme`, `useThemeColorScheme`, and `useThemeContainer`; configure them with `ThemeProvider`. The top-level theme stylesheet URLs and token values are unchanged.
- Worker apps retain provider-less CSS-variable values. Apps that supplied a context value can pass explicit values through `ThemeProvider`'s `theme` prop. Call-recorder and Granola require separately coordinated source and dependency upgrades before adopting this release; their current pinned UI versions do not expose the new prop.
- `twenty-ui/testing` no longer exports `RouterDecorator`, `ComponentWithRouterDecorator`, `RouteParams`, `isRouteParams`, or `computeLocation`. Use application-owned router decorators when routing is needed, or `ComponentDecorator` for router-free stories. React Router is no longer a peer dependency.
- `ResizeHandle` owns pointer and keyboard resizing through `value`/`onValueChange` or `defaultValue`, with configurable `min`, `max`, and `step`. The public `useResizeHandle` hook is removed.
- **Public module ownership changes without a deprecation window.** This release removes 55 public React exports and the `twenty-ui/primitives/json-visualizer` entry point. Applications using the removed imports must migrate when upgrading; compatibility exports are not provided.
- Import shared compositions, including `JsonTree`, menu presets, and Toast components and hooks, from `twenty-ui/components`. Foundational controls retain `twenty-ui/primitives/<family>` imports. The optional code editor retains `twenty-ui/components/code-editor`.
- Field displays, application links, placeholders, and feature animations are no longer package exports. External applications must own these integrations or compose supported primitives. Internal implementation parts are private.
- `Info` uses `href` and `render` in place of `to`. Replace `AnimatedEaseInOut` with `AnimatedExpandableContainer`.

Keep `twenty-ui`, `twenty-sdk`, and `twenty-client-sdk` versions aligned when upgrading Twenty apps.
