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

Component interaction and behavior tests belong in Storybook stories (`*.stories.tsx`) using `play` functions. Component unit tests are reserved for conformance (native props, refs, class names, rendering, and prop types). Keep non-interactive utility, hook, and token tests in the Vitest unit project; avoid duplicating story coverage there.

```bash
npx nx build twenty-ui                 # Build the library (dual ESM/CJS + types)
npx nx storybook:serve:dev twenty-ui   # Run Storybook
npx nx test twenty-ui                  # Run unit tests
npx vitest run --root packages/twenty-ui --project unit <file>   # Run a single test file
```

# License

twenty-ui is released under the [MIT](https://github.com/twentyhq/twenty/blob/main/packages/twenty-ui/LICENSE) license.

# Checkbox migration

Checkbox forwards Base UI's native props, refs, `render`, `checked` / `defaultChecked`, and `onCheckedChange(checked, eventDetails)`. Labels can wrap the control or use `Field.Label`; the control no longer supplies a hardcoded form name or test ID. Use controlled state with the form's `onReset` handler for native form resets.

| Previous API | Replacement |
| --- | --- |
| `onChange(event)` | `onCheckedChange(checked, eventDetails)` |
| `CheckboxSize.Small` / `.Large` | `size="sm"` / `"md"` |
| `CheckboxVariant.Primary` / `.Secondary` | `variant="solid"` / `"outline"` |
| `CheckboxVariant.Tertiary` | `variant="outline"` plus consumer border styling where needed |
| `CheckboxShape.Squared` / `.Rounded` | `shape="square"` / `"round"` |
| `CheckboxAccent.Blue` / `.Orange` | `color="accent"` / `"warning"` |

`color="success"` adds the green semantic color. `CheckboxSize`, `CheckboxShape`, and `CheckboxVariant` remain exported as union types; their old enum values and `CheckboxAccent` are removed. `hoverable` still controls the padded hover target and defaults to `true`. Dimensions and the existing blue/orange colors are preserved.

Run `node --import tsx tools/codemods/checkbox-api.ts` from the repository root to migrate enum values and callbacks that take no arguments. The script reports event handlers, spread props, conflicting props, and tertiary borders for manual migration before writing any files. It skips the Checkbox implementation and its own stories, and leaves a repeated run unchanged.

Use the boolean argument instead of `event.target.checked`. Read modifier keys from `eventDetails.event`. In a clickable row, stop the original click with `onClick={(event) => event.stopPropagation()}` when the checkbox has its own selection handler. Keep legacy wrapper callbacks boolean-only with `onCheckedChange={(checked) => onChange(checked)}`.
