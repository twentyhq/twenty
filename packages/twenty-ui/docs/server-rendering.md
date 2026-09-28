# Server rendering

Production entries import through ESM and CommonJS in Node without browser globals and render with `renderToString`. Focus, layout measurement, pointer handling, and overlay positioning only run in the browser.

- `getUserDevice()` returns `unknown` without a user agent, so `getOsControlSymbol()` and `getOsShortcutSeparator()` fall back to `Ctrl` and a space. `Button` hotkeys keep that separator during hydration, then switch to the platform one. Labels you pass yourself, such as `getOsControlSymbol()`, render as given.
- `useIsMobile()` and `useIsTouchDevice()` return `false` on the server and during hydration.
- `ThemeProvider` skips document updates on the server, and `Toaster` renders nothing without a document.
- `twenty-ui/components/code-editor` needs its optional Monaco peers and renders a loading placeholder on the server.

## Checks

```sh
npx nx test:package twenty-ui
npx nx test:package:packed twenty-ui
```

The first imports and server-renders the built entries in Node. The second does the same from the packed tarball in a standalone npm project, with and without the Monaco peers. CI runs both.
