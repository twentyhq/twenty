import { isFunction } from '@sniptt/guards';

import { type THEME_LIGHT } from '../constants/ThemeLight';
import { themeCssVariables } from '../themeCssVariables';
import { type ThemeType } from '../themeTypes';

type StaticTheme = typeof THEME_LIGHT;

const isStaticTheme = (theme: ThemeType | StaticTheme): theme is StaticTheme =>
  isFunction(theme.spacing);

export const resolveExplicitTheme = (
  theme: ThemeType | StaticTheme,
): ThemeType => {
  if (!isStaticTheme(theme)) {
    return theme;
  }

  const spacing = Object.fromEntries(
    Object.keys(themeCssVariables.spacing).map((spacingKey) => [
      spacingKey,
      theme.spacing(Number(spacingKey)),
    ]),
  ) as ThemeType['spacing'];

  return { ...theme, spacing };
};
