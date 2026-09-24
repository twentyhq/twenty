# Changelog

## [Unreleased]

### Breaking Changes

- `twenty-ui/testing` no longer exports `RouterDecorator`, `ComponentWithRouterDecorator`, `RouteParams`, `isRouteParams`, or `computeLocation`. Use application-owned router decorators when routing is needed, or `ComponentDecorator` for router-free stories. React Router is no longer a peer dependency.
- `ResizeHandle` owns pointer and keyboard resizing through `value`/`onValueChange` or `defaultValue`, with configurable `min`, `max`, and `step`. The public `useResizeHandle` hook is removed.
- **Public module ownership changes without a deprecation window.** This release removes 55 public React exports and the `twenty-ui/primitives/json-visualizer` entry point. Applications using the removed imports must migrate when upgrading; compatibility exports are not provided.
- Import shared compositions, including `JsonTree`, menu presets, and Toast components and hooks, from `twenty-ui/components`. Foundational controls retain `twenty-ui/primitives/<family>` imports. The optional code editor retains `twenty-ui/components/code-editor`.
- Field displays, application links, placeholders, and feature animations are no longer package exports. External applications must own these integrations or compose supported primitives. Internal implementation parts are private.
- `Info` uses `href` and `render` in place of `to`. Replace `AnimatedEaseInOut` with `AnimatedExpandableContainer`.
- `SegmentedControl` is a radio group. Use `aria-label` or `aria-labelledby` (one is required), `value` or `defaultValue`, and `onValueChange(value, eventDetails)` in place of `ariaLabel`, `value`, and `onChange(value)`. Options take `startIcon` and `'aria-label'` in place of `Icon` and `ariaLabel`. `role` and `width` are removed: use `Tabs` for tab lists and `className` or `style` to size the control. Arrow keys select the next option, Enter no longer selects, and choosing the selected option again no longer calls `onValueChange`.

Keep `twenty-ui`, `twenty-sdk`, and `twenty-client-sdk` versions aligned when upgrading Twenty apps.
