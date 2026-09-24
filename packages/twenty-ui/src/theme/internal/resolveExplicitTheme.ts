import { isFunction } from '@sniptt/guards';

import { type THEME_LIGHT } from '../constants/ThemeLight';
import { themeCssVariables } from '../themeCssVariables';
import { type ThemeType } from '../themeTypes';

type StaticTheme = typeof THEME_LIGHT;

const isStaticTheme = (theme: ThemeType | StaticTheme): theme is StaticTheme =>
  isFunction(theme.spacing);

const resolveSpacingEntries = <TSpacingKey extends string>(
  spacingEntries: Record<TSpacingKey, string>,
  spacing: StaticTheme['spacing'],
): Record<TSpacingKey, string> => {
  const resolvedSpacingEntries = { ...spacingEntries };

  for (const spacingKey in resolvedSpacingEntries) {
    resolvedSpacingEntries[spacingKey] = spacing(Number(spacingKey));
  }

  return resolvedSpacingEntries;
};

export const resolveExplicitTheme = (
  theme: ThemeType | StaticTheme,
): ThemeType => {
  if (!isStaticTheme(theme)) {
    return theme;
  }

  return {
    ...theme,
    spacing: resolveSpacingEntries(themeCssVariables.spacing, theme.spacing),
  };
};
