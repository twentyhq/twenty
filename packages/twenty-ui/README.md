<p align="center">
  <img src="https://raw.githubusercontent.com/twentyhq/twenty/main/packages/twenty-ui/logo.png" width="136" height="136" alt="twenty-ui logo" />
</p>

# twenty-ui

Twenty's open-source React UI component library: components, icons, and design tokens built on a zero-runtime, CSS-variable styling layer.

> **Alpha:** `twenty-ui` is still in alpha. Its version number follows the Twenty SDK release cycle. APIs and component behavior may change between releases.

# Installation

```bash
npm install twenty-ui
```

`react`, `react-dom`, and `monaco-editor` are peer dependencies (install them in your app). `monaco-editor` is only required if you use the code editor components.

# Usage

Import the base styles once, pick a theme stylesheet, and wrap your app in `ThemeProvider`:

```tsx
import { ThemeProvider } from 'twenty-ui/theme-constants';
import { Button } from 'twenty-ui/input';

import 'twenty-ui/style.css';
import 'twenty-ui/theme-light.css';

export const App = () => (
  <ThemeProvider colorScheme="light">
    <Button title="Click me" />
  </ThemeProvider>
);
```

Components are available from the root entry point or from a specific subpath for better tree-shaking:

```tsx
import { Button } from 'twenty-ui';
import { Button } from 'twenty-ui/input';
```

# Entry points

| Subpath | Contents |
| --- | --- |
| `twenty-ui` | All components, icons, theme tokens, and utilities |
| `twenty-ui/accessibility` | Accessibility helpers |
| `twenty-ui/assets` | Logos and static assets |
| `twenty-ui/data-display` | Avatars, chips, tags, and other display components |
| `twenty-ui/feedback` | Progress bars, loaders, and status feedback |
| `twenty-ui/icon` | Icon components and the icon provider |
| `twenty-ui/input` | Buttons, switches, and form inputs |
| `twenty-ui/json-visualizer` | JSON tree viewer |
| `twenty-ui/layout` | Layout primitives |
| `twenty-ui/navigation` | Menus, links, and navigation components |
| `twenty-ui/surfaces` | Cards, tooltips, and surface components |
| `twenty-ui/testing` | Storybook and test decorators |
| `twenty-ui/theme` | Theme types and helpers |
| `twenty-ui/theme-constants` | Design tokens, `ThemeProvider`, and `useTheme` |
| `twenty-ui/typography` | Text and typography components |
| `twenty-ui/utilities` | Hooks and shared utilities |

# Theming

- `twenty-ui/style.css` ships the base reset and component styles. Import it once.
- `twenty-ui/theme-light.css` and `twenty-ui/theme-dark.css` define the design-token CSS variables for each color scheme.
- `ThemeProvider` exposes the active theme through `useTheme()` and applies the `light` / `dark` class. Pass `applyToRoot={false}` with `overrides` to scope a theme to a subtree instead of the document root.

# Development

## Internal state

twenty-ui uses Jotai internally for notification state. Twenty already uses Jotai, so this keeps state management familiar to contributors and replaces subscription machinery we would otherwise maintain ourselves. Queue rules and rendering remain owned by twenty-ui. Consumers do not need to create atoms or configure a Jotai provider.

Each notification provider creates a private store, passed explicitly to the internal Jotai hooks. This keeps notification state isolated without changing the consuming application's Jotai scope. See [Jotai's library isolation guidance](https://jotai.org/docs/extensions/scope#createisolation).

The tradeoff is a runtime dependency and its lifecycle conventions in place of a small custom store. In a standalone production bundle measured on September 10, 2026, the Jotai 2.17.1 APIs used here contributed approximately 3.6 kB gzipped, excluding React. This is not a measurement of the application's incremental bundle size: the library build keeps Jotai external, and a consuming bundler can share a compatible existing copy. twenty-front and twenty-ui use the same Jotai version range.

## Testing

Component interaction and behavior tests belong in Storybook stories (`*.stories.tsx`) using `play` functions. Component unit tests are reserved for conformance (native props, refs, class names, rendering, and prop types). Keep non-interactive utility, hook, and token tests in the Vitest unit project; avoid duplicating story coverage there.

```bash
npx nx build twenty-ui                 # Build the library (dual ESM/CJS + types)
npx nx storybook:serve:dev twenty-ui   # Run Storybook
npx nx test twenty-ui                  # Run unit tests
npx vitest run --root packages/twenty-ui --project unit <file>   # Run a single test file
```

# License

twenty-ui is released under the [MIT](https://github.com/twentyhq/twenty/blob/main/packages/twenty-ui/LICENSE) license.
