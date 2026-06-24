# twenty-ui

Twenty's open-source React UI component library: components, icons, and design tokens built on a zero-runtime, CSS-variable styling layer.

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
| `twenty-ui/input` | Buttons, toggles, and form inputs |
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

```bash
npx nx build twenty-ui                 # Build the library (dual ESM/CJS + types)
npx nx storybook:serve:dev twenty-ui   # Run Storybook
npx nx test twenty-ui                  # Run unit tests
```

# License

twenty-ui is released under the [AGPL-3.0](https://github.com/twentyhq/twenty/blob/main/packages/twenty-ui/LICENSE) license.
