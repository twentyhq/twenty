# Server rendering and platform utilities

Production JavaScript entries can be imported through ESM or CommonJS in Node without `window`, `document`, `navigator`, CSS APIs, or DOM observers. The package checks cover imports and representative `renderToString` calls; they do not imply that interactive browser controls run in Node.

`getUserDevice()` from `twenty-ui/utilities` returns `unknown` when `navigator` or its string `userAgent` is unavailable. An empty or unrecognized user agent also returns `unknown`. iPhone and iPad user agents return `ios`, and Android user agents return `android`. `getOsControlSymbol()` and `getOsShortcutSeparator()` return `⌘` and no separator on Mac and iOS, and `Ctrl` and a space elsewhere, including on the server. Device detection is presentation information, not a capability or security check.

`Button` hotkeys render with a space separator on the server and during hydration, then switch to the platform separator. Hotkey labels an application passes to `Button`, such as the result of `getOsControlSymbol()`, are rendered as given; applications hydrating platform-specific labels must keep their initial client output consistent with the server.

`useIsMobile()` and `useIsTouchDevice()` retain their deterministic `false` server snapshots and existing missing-`matchMedia` behavior. In the worker renderer, neither result promises host viewport or input capability detection.

## Themes and portals

Use `twenty-ui/theme`. Provider-less rendering retains CSS-variable references, including in workers, so the host stylesheet controls light and dark values. Scoped providers preserve their classes and custom property overrides during server rendering. Their DOM containers become available after mounting. Explicit `ThemeProvider` values, such as `THEME_DARK`, work without computed styles. Root scaling and class updates require a document and do not run on the server.

`Toaster` renders no portal without a document or when `container={null}`. Browser portal containers and scoped themes retain their existing behavior. Server rendering does not exercise focus, layout measurement, pointer handling, or interactive overlay positioning.

## Optional editor

`twenty-ui/components/code-editor` requires the optional `@monaco-editor/react` and `monaco-editor` peers documented in the package manifest. It imports in Node and renders its loading placeholder on the server. Monaco loads after mounting in the browser, where the host must configure its workers. Ordinary production entries do not require these peers. Server placeholder rendering does not establish Monaco compatibility with the component worker renderer.

## Verification

From the repository root:

```sh
npx nx test:package twenty-ui
npx nx test:package:packed twenty-ui
```

The first check imports built production entries in fresh Node processes and exercises shortcut buttons, responsive hooks, provider-less, scoped and explicit themes, Toaster, Tooltip, overflowing text, and the optional editor placeholder through ESM and CommonJS. `twenty-ui/testing` is development support and is excluded from this production check.

The packed check creates a temporary standalone npm consumer outside the workspace, installs the tarball with React and React DOM peers, and runs the same checks with optional peers absent. It then installs the editor peers and checks that entry separately. It requires registry access and removes its temporary directory after completion. CI runs both checks. They cover runtime package resolution, not every component interaction.

The responsive renderer gallery exercises device labels, shortcut separators, shortcut buttons, and native media-query fallbacks in both React and Preact. Browser event handlers in Dropdown, focus handling in overflowing text, and DOM observer effects remain browser behavior.
