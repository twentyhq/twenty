import { useLayoutEffect } from 'react';

import {
  THEME_DARK_CSS_VARIABLE_ENTRIES,
  THEME_LIGHT_CSS_VARIABLE_ENTRIES,
} from '@ui/theme-constants';

export const ThemeCssVariableInjectorEffect = ({
  theme,
}: {
  theme: { name: string };
}) => {
  const entries =
    theme.name === 'dark'
      ? THEME_DARK_CSS_VARIABLE_ENTRIES
      : THEME_LIGHT_CSS_VARIABLE_ENTRIES;

  useLayoutEffect(() => {
    const root = document.documentElement;
    for (const [name, value] of entries) {
      root.style.setProperty(name, value);
    }
    return () => {
      for (const [name] of entries) {
        root.style.removeProperty(name);
      }
    };
  }, [entries]);

  return null;
};
