import { type ComponentProps } from 'react';

import { type ThemeProvider } from '../src/theme/ThemeProvider';

export const THEME_PROVIDER_PROP_DESCRIPTIONS = {
  children: 'Components that share this theme.',
  colorScheme:
    'Explicit light or dark palette; load its stylesheet before rendering.',
  applyToRoot:
    'Applies the color-scheme class to the document root. Set false for a scoped wrapper.',
  overrides:
    'CSS custom-property overrides. Supplying them creates a scoped wrapper.',
  className:
    'Class applied to a scoped wrapper; no wrapper is created for className alone.',
  scale:
    'Root interface scale stored in --t-scale-user. Ignored for scoped providers; application CSS must consume the variable.',
  theme:
    'Explicit resolved theme values, bypassing computed-style token resolution.',
} satisfies Partial<Record<keyof ComponentProps<typeof ThemeProvider>, string>>;
