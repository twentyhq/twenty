# Changelog

## [Unreleased]

### Breaking Changes

- `twenty-ui/testing` no longer exports `RouterDecorator`, `ComponentWithRouterDecorator`, `RouteParams`, `isRouteParams`, or `computeLocation`. Use application-owned router decorators when routing is needed, or `ComponentDecorator` for router-free stories. React Router is no longer a peer dependency.

- **Public module ownership changes without a deprecation window.** This release removes 55 public React exports and the `twenty-ui/primitives/json-visualizer` entry point. Applications using the removed imports must migrate when upgrading; compatibility exports are not provided.
- Import shared compositions, including `JsonTree`, menu presets, and Toast components and hooks, from `twenty-ui/components`. Foundational controls retain `twenty-ui/primitives/<family>` imports. The optional code editor retains `twenty-ui/components/code-editor`.
- Field displays, application links, placeholders, and feature animations are no longer package exports. External applications must own these integrations or compose supported primitives. Internal implementation parts are private.
- `Info` uses `href` and `render` in place of `to`. Replace `AnimatedEaseInOut` with `AnimatedExpandableContainer`.

Keep `twenty-ui`, `twenty-sdk`, and `twenty-client-sdk` versions aligned when upgrading Twenty apps.
