# Responsive hooks

Import `useIsMobile` and `useIsTouchDevice` from `twenty-ui/utilities`.
`useIsMobile` matches `(max-width: 768px)`, including the breakpoint itself.
`useIsTouchDevice` independently matches `(hover: none) and (pointer: coarse)`.
A narrow desktop window can still hover; a wide touch device can still use coarse input.

The first client render reads the current native query result. Each mounted hook
subscribes to query changes and releases its listener on unmount. Server rendering
and the first hydration render return `false`, then hydration reads the browser's
current result. Environments without `window.matchMedia` return `false` for both
hooks. `react-responsive` context overrides are no longer supported; stories should
use a real viewport or a scoped `matchMedia` mock.

The front component renderer currently has no host media-query bridge. Its React
and Preact fixtures therefore verify fallback values and usable controls, not host
viewport or touch detection. Host geometry alone does not establish touch capability.
Provider-less theme CSS variables continue to resolve in the host theme.

The workspace audit found `useScreenSize` only in its implementation and generated
barrel, with no source, story, documentation, or public-type consumer. Its removal
is a breaking export change. No `packages/twenty-apps` files are changed here;
Call-recorder and Granola depend on `twenty-ui@^1.0.0-alpha.1`, and Companion pins
`twenty-ui@1.0.0-alpha.1`. None consumes the removed hook. Their dependency upgrades
remain separate; the Call-recorder/Granola provider migration is owned by the theme
cleanup (PR #26482). This branch retains the existing `theme-constants` entry and
must take the theme import update when those changes are integrated.
