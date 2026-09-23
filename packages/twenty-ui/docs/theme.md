# Theme

Import `ThemeProvider`, `useTheme`, `useThemeColorScheme`, `useThemeContainer`, `themeCssVariables`, and public theme types and constants from `twenty-ui/theme`. `THEME_LIGHT` and `THEME_DARK` remain available for styles, Stripe configuration, and other consumers that need static values. Load the existing `twenty-ui/theme-light.css` and `twenty-ui/theme-dark.css` stylesheets to supply CSS variables.

`ThemeProvider` applies the color-scheme class to the document root by default. Set `applyToRoot={false}` to scope the class to its children. `overrides` accepts CSS custom properties and creates a scope. Nested scopes resolve their own values, and `useThemeContainer()` identifies the nearest scope for portals. A popup's explicit `container` continues to take precedence over that scope. Root providers retain the `scale` preference; scoped providers ignore it.

Contexts initialize when a provider or hook is used, so importing static tokens also works under React’s server condition.

`useTheme()` without a provider returns CSS-variable references. Worker-rendered apps rely on these references resolving in the host document when its color scheme changes. Supplying static light values as a default would freeze those apps in light mode.

For consumers that need concrete JavaScript values in a worker, pass the theme explicitly:

```tsx
import {
  THEME_DARK,
  THEME_LIGHT,
  ThemeProvider,
  type ThemeType,
} from 'twenty-ui/theme';

<ThemeProvider
  colorScheme={colorScheme}
  applyToRoot={false}
  theme={(colorScheme === 'dark' ? THEME_DARK : THEME_LIGHT) as unknown as ThemeType}
>
  {children}
</ThemeProvider>;
```

The explicit `theme` supplies hook values and updates when the prop changes. CSS classes, overrides, scaling, and portal scope retain their existing behavior. CSS overrides do not modify an explicitly supplied theme object. Static theme constants retain their callable spacing helper, while `ThemeType` describes resolved CSS spacing entries, so the existing static-theme assertion remains necessary.

Raw contexts and their implementation types are private. Replace a direct context read with the corresponding hook, including separate hook calls when reading both the theme and color scheme. The React and Preact theme-token gallery stories demonstrate the public provider configuration used to replace the call-recorder and Granola context providers.

The separately versioned apps under `packages/twenty-apps` must upgrade their source and aligned UI/SDK dependencies together. Their current UI versions cannot use the new provider prop. This workspace migration leaves those packages unchanged.
