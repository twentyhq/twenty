import { useLayoutEffect, useMemo } from 'react';

import { type ThemeType } from '@ui/theme/types/ThemeType';
import { prepareThemeForRootCssVariableInjection } from '@ui/theme/utils/prepareThemeForRootCssVariableInjection';

export const ThemeCssVariableInjectorEffect = ({
  theme,
}: {
  theme: ThemeType;
}) => {
  const themeCssVariableEntries = useMemo(
    () =>
      prepareThemeForRootCssVariableInjection({
        themeNode: theme as unknown as Record<string, unknown>,
        prefix: 't',
      }),
    [theme],
  );

  useLayoutEffect(() => {
    const root = document.documentElement;
    for (const [name, value] of themeCssVariableEntries) {
      root.style.setProperty(name, value);
    }
    return () => {
      for (const [name] of themeCssVariableEntries) {
        root.style.removeProperty(name);
      }
    };
  }, [themeCssVariableEntries]);

  return null;
};
