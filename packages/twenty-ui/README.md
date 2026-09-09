<p align="center">
  <img src="https://raw.githubusercontent.com/twentyhq/twenty/main/packages/twenty-ui/logo.png" width="136" height="136" alt="twenty-ui logo" />
</p>

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

# Migrating Toggle to Switch

Import `Switch` from `twenty-ui/input`. Replace `value` with `checked`, `onChange` with `onCheckedChange`, and `toggleSize="small"` / `"medium"` with `size="sm"` / `"md"`. The default size remains `md`. The old `Toggle`, `ToggleProps`, and `ToggleSize` exports have been removed.

```tsx
<Switch
  aria-label="Notifications"
  checked={notificationsEnabled}
  onCheckedChange={setNotificationsEnabled}
  size="sm"
/>
```

Use `defaultChecked` for uncontrolled state. `value` now identifies the string submitted with a form. Native props, refs, and Base UI's `render`, state callbacks, and cancelable change details pass through. Base UI 1.8 does not reset uncontrolled switch state on a native form reset; use controlled state and the form's `onReset` handler, as shown in the `FormAndField` story.

Replace `color` with the CSS `color` property and `centered` with `align-self: center`. In twenty-front, apply these through Linaria styled components and use `themeCssVariables` for theme colors. The default color is already blue. The legacy `MenuItemToggle` and `AdvancedSettingsToggle` wrappers retain their existing APIs.

From the repository root, run `npx tsx tools/codemods/toggle-to-switch.ts` to migrate direct JSX consumers. The script is idempotent and flags spread props, dynamic sizes, existing style objects, and frontend color or centering props for manual migration.

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

Component interaction and behavior tests belong in Storybook stories (`*.stories.tsx`) using `play` functions. Component unit tests are reserved for conformance (native props, refs, class names, rendering, and prop types). Keep non-interactive utility, hook, and token tests in the Vitest unit project; avoid duplicating story coverage there.

```bash
npx nx build twenty-ui                 # Build the library (dual ESM/CJS + types)
npx nx storybook:serve:dev twenty-ui   # Run Storybook
npx nx test twenty-ui                  # Run unit tests
npx vitest run --root packages/twenty-ui --project unit <file>   # Run a single test file
```

# License

twenty-ui is released under the [MIT](https://github.com/twentyhq/twenty/blob/main/packages/twenty-ui/LICENSE) license.
