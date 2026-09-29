<p align="center">
  <img src="https://raw.githubusercontent.com/twentyhq/twenty/main/packages/twenty-ui/logo.png" width="136" height="136" alt="twenty-ui logo" />
</p>

# twenty-ui

Twenty's open-source React UI library provides foundational primitives, shared components, icons, and theme tokens. It ships prebuilt CSS with CSS variables, so consuming applications do not need a CSS-in-JS compiler.

Read the [twenty-ui documentation](https://docs.twenty.com/ui/getting-started) for setup, theming, and component guides.

> **Alpha:** `twenty-ui` is still in alpha. Its version number follows the Twenty SDK release cycle. APIs and component behavior may change between releases.

## Upgrading

Read the [breaking release notes](./CHANGELOG.md#unreleased) before upgrading. They cover component API changes, moved imports, and removed exports.

## Installation

For a standalone React application, install the library and its peer dependencies. React 19 is required.

```bash
npm install twenty-ui react@^19 react-dom@^19
```

The code editor is available separately from `twenty-ui/components/code-editor`. Applications using that entry point must install its optional peers and configure Monaco workers for their bundler before mounting the editor:

```bash
npm install @monaco-editor/react monaco-editor
```

For Twenty apps, follow [Using Twenty UI components](https://docs.twenty.com/developers/extend/apps/layout/front-components#using-twenty-ui-components). The front component renderer supplies the workspace theme. Keep `twenty-ui`, `twenty-sdk`, and `twenty-client-sdk` on the same version.

## Usage

For a standalone React application, import the base styles once, pick a theme stylesheet, and wrap your app in `ThemeProvider`:

```tsx
import { Button } from 'twenty-ui/primitives/input';
import { ThemeProvider } from 'twenty-ui/theme';

import 'twenty-ui/style.css';
import 'twenty-ui/theme-light.css';

export const App = () => (
  <ThemeProvider colorScheme="light">
    <Button>Click me</Button>
  </ThemeProvider>
);
```

The component stylesheet includes a global reset. Load it once at your application entry point.

## Entry points

Primitives provide foundational controls, including compound controls such as Select, Menu, and Dialog. Shared components compose them into presets such as `MainButton`, `LightButton`, `Dropdown`, and `Toaster`. Both layers receive data, labels, and callbacks from the application.

Prefer the matching public subpath for focused imports. The root entry point also re-exports primitives, shared components, icons, theme tokens, and utilities. Assets, testing helpers, and the optional code editor have separate entry points.

| Subpath                              | Contents                                                   |
| ------------------------------------ | ---------------------------------------------------------- |
| `twenty-ui/assets`                   | Logos and static assets                                    |
| `twenty-ui/components`               | Presets, pickers, menu rows, toasts, and the JSON viewer   |
| `twenty-ui/components/code-editor`   | Code editor, editor header, and editor theme helpers       |
| `twenty-ui/icon`                     | Icon components and the icon provider                      |
| `twenty-ui/primitives`               | All primitive families                                     |
| `twenty-ui/primitives/accessibility` | Hidden elements and keyboard interaction helpers           |
| `twenty-ui/primitives/data-display`  | Avatars, chips, tags, color samples, and status indicators |
| `twenty-ui/primitives/feedback`      | Banners, progress bars, and loaders                        |
| `twenty-ui/primitives/input`         | Buttons and form controls                                  |
| `twenty-ui/primitives/layout`        | Expansion, separators, direction, and resizing             |
| `twenty-ui/primitives/navigation`    | Action links, list items, and tabs                         |
| `twenty-ui/primitives/surfaces`      | Cards, dialogs, menus, popovers, and tooltips              |
| `twenty-ui/primitives/typography`    | Text and headings                                          |
| `twenty-ui/testing`                  | Storybook and test decorators and helpers                  |
| `twenty-ui/theme`                    | Theme provider, hooks, types, and tokens                   |
| `twenty-ui/utilities`                | Hooks and shared utilities                                 |

Import icons such as `IconCheck` from `twenty-ui/icon`. The dynamic icon provider includes the full catalog, so use it when icons need to be looked up at runtime.

## Theming

- `twenty-ui/style.css` ships the base reset and component styles. Import it once.
- `twenty-ui/theme-light.css` and `twenty-ui/theme-dark.css` define the design-token CSS variables for each color scheme. Load both when your application switches between schemes.
- `ThemeProvider` applies the `light` or `dark` class to the document root by default. Set `applyToRoot={false}` to scope a theme to a subtree; `overrides` optionally customizes public `--t-` CSS variables.
- Import `themeCssVariables` for CSS variable references, `useTheme()` for theme values, and `useThemeColorScheme()` for the active scheme, all from `twenty-ui/theme`.
- The provider's `theme` prop supplies explicit JavaScript values, such as `THEME_LIGHT` or `THEME_DARK`, for consumers that cannot read computed styles. It does not replace the theme stylesheets.

See the [theming guide](https://docs.twenty.com/ui/theming) for scoped overrides, portals, and explicit values.

## Responsive hooks

Import responsive hooks and media-query constants from `twenty-ui/utilities`, `MOBILE_VIEWPORT` from `twenty-ui/theme`, and story overrides from `twenty-ui/testing`.

- `useIsMobile` matches `MOBILE_MEDIA_QUERY` (up to and including `MOBILE_VIEWPORT`). `useIsTouchDevice` matches `TOUCH_DEVICE_MEDIA_QUERY` and is independent of width: branch interaction behavior on it, and layout on `useIsMobile`.
- `useMediaQuery(query)` subscribes to native `matchMedia` changes and shares one `MediaQueryList` per query. It returns `false` during server rendering and the first hydration render, and wherever `window.matchMedia` is unavailable, including the front component sandbox.
- To force a result in a story, return `overrideMediaQueryMatches({ [MOBILE_MEDIA_QUERY]: true })` from `beforeEach`; the returned cleanup restores the native `matchMedia`.

## Development

Use the Node.js version in the repository's `.nvmrc` and the Yarn version in its root `package.json`. Run the following commands from the repository root:

```bash
yarn install
npx nx generateBarrels twenty-ui
npx nx storybook:serve:dev twenty-ui
```

Storybook runs at `http://localhost:6008`.

| Command                                                 | Purpose                                        |
| ------------------------------------------------------- | ---------------------------------------------- |
| `npx nx build twenty-ui`                                | Build ESM, CommonJS, CSS, and TypeScript types |
| `npx nx lint twenty-ui`                                 | Check lint and formatting                      |
| `npx tsgo -p packages/twenty-ui/tsconfig.json --noEmit` | Check types directly, without the Nx cache     |
| `npx nx test twenty-ui`                                 | Check module ownership and run unit tests      |
| `npx nx storybook:build twenty-ui`                      | Build Storybook                                |
| `npx nx storybook:test twenty-ui`                       | Run browser stories with coverage              |
| `npx nx test:package twenty-ui`                         | Check optional dependencies and theme exports  |

Before running browser stories, install Chromium with `npx playwright install chromium` from `packages/twenty-ui`.

### Source layout and generated files

Primitives live in `src/primitives/<family>`, shared components in `src/components/<family>`, and the optional editor in `src/components/code-editor`. Keep each component's types, stories, tests, and private parts beside its implementation. Components use SCSS modules and theme CSS variables.

Record formatting, routing, product illustrations, and feature-specific animation belong to the host application. Implementation parts in `internal` or `parts` directories are excluded from public barrels.

- Run `npx nx generateBarrels twenty-ui` after changing public exports. Do not edit generated barrels by hand.
- Edit token sources in `design-tokens`, then run `npx nx generateTokens twenty-ui`. Use `npx nx generate:check twenty-ui` to check that generated token files are current.
- Run `npx nx check:ownership twenty-ui` after changing the public interface. When intentionally adding or removing a public React component, run `node --import tsx packages/twenty-ui/scripts/checkModuleOwnership.ts --write` from the repository root and review the `docs/module-ownership.json` diff. CI checks the snapshot and dependency boundaries without updating them.

### Documentation

Primitive guides belong in `packages/twenty-docs/ui/primitives`. Shared component guides belong in `packages/twenty-docs/ui/components`. For each stateful API that supports both modes, include separate **Uncontrolled state** and **Controlled state** examples with the same scenario, labels, and initial state. Keep each example complete, with public imports and one exported example component.

Explain state ownership before advanced behavior such as indeterminate selection or manual tab activation. Document independent states, such as selection and popup visibility, separately. For components that delegate state to a parent or group, explain that ownership and link to the relevant examples.

For compound components, include an anatomy tree and identify required parts, optional parts, and elements supplied internally. Show supported composition with complete examples, use Twenty UI components for supporting controls, and explain how custom wrappers preserve props and refs. Use `text` fences for structural diagrams and `tsx` fences for runnable examples so the documentation checker validates the examples.

Run `npx nx check:ui twenty-docs` to validate generated references and documentation examples.

### Testing

Component interaction and behavior tests belong in Storybook stories (`*.stories.tsx`) using `play` functions. Component unit tests are reserved for conformance (native props, refs, class names, rendering, and prop types). Keep non-interactive utility, hook, and token tests in the Vitest unit project; avoid duplicating story coverage there.

```bash
npx vitest run --root packages/twenty-ui --project unit <file>
npx vitest run --root packages/twenty-ui --project storybook <file>
```

The unit project runs in jsdom. The Storybook project runs in headless Chromium through Playwright, including story interactions and accessibility checks.

## License

twenty-ui is released under the [MIT](https://github.com/twentyhq/twenty/blob/main/packages/twenty-ui/LICENSE) license.
