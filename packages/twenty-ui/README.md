<p align="center">
  <img src="https://raw.githubusercontent.com/twentyhq/twenty/main/packages/twenty-ui/logo.png" width="136" height="136" alt="twenty-ui logo" />
</p>

# twenty-ui

Twenty's open-source React UI component library: components, icons, and design tokens built on a zero-runtime, CSS-variable styling layer.

Read the [twenty-ui documentation](https://docs.twenty.com/ui/getting-started) for setup, theming, and component guides.

> **Alpha:** `twenty-ui` is still in alpha. Its version number follows the Twenty SDK release cycle. APIs and component behavior may change between releases.

# Installation

For a standalone React application, install the library and its peer dependencies. React 19 is required.

```bash
npm install twenty-ui react@^19 react-dom@^19
```

The code editor is available separately from `twenty-ui/components/code-editor`. Only applications using that entry point need to install its optional peers:

```bash
npm install @monaco-editor/react monaco-editor
```

Import `CodeEditor`, `CoreEditorHeader`, and the editor theme helpers from `twenty-ui/components/code-editor`. They are no longer exported from `twenty-ui/primitives/input`, `twenty-ui/primitives`, or `twenty-ui`. Configure Monaco workers for your bundler before mounting the editor.

For Twenty apps, follow [Using Twenty UI components](https://docs.twenty.com/developers/extend/apps/layout/front-components#using-twenty-ui-components). The front component renderer supplies the workspace theme. Keep `twenty-ui`, `twenty-sdk`, and `twenty-client-sdk` on the same version.

# Usage

For a standalone React application, import the base styles once, pick a theme stylesheet, and wrap your app in `ThemeProvider`:

```tsx
import { ThemeProvider } from 'twenty-ui/theme-constants';
import { Button } from 'twenty-ui/primitives/input';

import 'twenty-ui/style.css';
import 'twenty-ui/theme-light.css';

export const App = () => (
  <ThemeProvider colorScheme="light">
    <Button>Click me</Button>
  </ThemeProvider>
);
```

Prefer the matching subpath for better tree-shaking. Imports from the `twenty-ui` root entry point are also supported.

```tsx
import { Button } from 'twenty-ui/primitives/input';
```

# Entry points

| Subpath | Contents |
| --- | --- |
| `twenty-ui` | Components except the code editor, icons, theme tokens, and utilities |
| `twenty-ui/assets` | Logos and static assets |
| `twenty-ui/components` | Shared design presets and reusable app building blocks |
| `twenty-ui/components/code-editor` | Code editor, editor header, and editor theme helpers |
| `twenty-ui/icon` | Icon components and the icon provider |
| `twenty-ui/primitives` | Foundational UI controls and compound controls |
| `twenty-ui/primitives/accessibility` | Hidden elements and keyboard interaction helpers |
| `twenty-ui/primitives/data-display` | Avatars, chips, tags, status indicators, and display helpers |
| `twenty-ui/primitives/feedback` | Toasts, banners, progress bars, and loaders |
| `twenty-ui/primitives/input` | Buttons, form controls, and pickers |
| `twenty-ui/primitives/json-visualizer` | JSON tree viewer |
| `twenty-ui/primitives/layout` | Layout, animation, resizing, and section components |
| `twenty-ui/primitives/navigation` | Links, list items, menus, and tabs |
| `twenty-ui/primitives/surfaces` | Cards, dialogs, menus, popovers, and tooltips |
| `twenty-ui/primitives/typography` | Text, headings, labels, and typography helpers |
| `twenty-ui/testing` | Storybook and test decorators |
| `twenty-ui/theme` | Theme types and helpers |
| `twenty-ui/theme-constants` | Design tokens, `ThemeProvider`, and `useTheme` |
| `twenty-ui/utilities` | Hooks and shared utilities |

# Theming

- `twenty-ui/style.css` ships the base reset and component styles. Import it once.
- `twenty-ui/theme-light.css` and `twenty-ui/theme-dark.css` define the design-token CSS variables for each color scheme.
- `ThemeProvider` exposes the active theme through `useTheme()` and applies the `light` / `dark` class. Pass `applyToRoot={false}` with `overrides` to scope a theme to a subtree instead of the document root.

# Development

Primitive guides belong in `packages/twenty-docs/ui/primitives`. Shared component guides belong in `packages/twenty-docs/ui/components`. For each stateful API that supports both modes, include separate **Uncontrolled state** and **Controlled state** examples with the same scenario, labels, and initial state. Keep each example complete, with public imports and one exported example component.

Explain state ownership before advanced behavior such as indeterminate selection or manual tab activation. Document independent states, such as selection and popup visibility, separately. For components that delegate state to a parent or group, explain that ownership and link to the relevant examples.

For compound components, include an anatomy tree and identify required parts, optional parts, and elements supplied internally. Show supported composition with complete examples, use Twenty UI components for supporting controls, and explain how custom wrappers preserve props and refs. Use `text` fences for structural diagrams and `tsx` fences for runnable examples so the documentation checker validates the examples.

## Internal state

twenty-ui uses Base UI's store for notification state. Each `ToastProvider` creates its own store, and the toaster subscribes to the toast list. Queue rules and rendering remain owned by twenty-ui. Consumers use `useToast()` without configuring a state library.

The store factory and subscription hook are internal to the toast module. `@base-ui/utils` is a direct dependency pinned to the version used by `@base-ui/react`, and the library build keeps it external. Review its store API changes when upgrading the dependency.

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
