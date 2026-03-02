import { THEME_LIGHT } from '@ui/theme/constants/ThemeLight';
import { type ThemeType } from '@ui/theme/types/ThemeType';
import { buildThemeReferencingRootCssVariables } from '@ui/theme/utils/buildThemeReferencingRootCssVariables';

type DeepCSSVariableRefs<T> = {
  [K in keyof T]: T[K] extends (...args: never[]) => unknown
    ? Record<string | number, string>
    : T[K] extends Record<string, unknown>
      ? DeepCSSVariableRefs<T[K]>
      : string;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const themeCssVariables: DeepCSSVariableRefs<ThemeType> =
  buildThemeReferencingRootCssVariables({
    themeNode: THEME_LIGHT,
    prefix: 't',
  }) as DeepCSSVariableRefs<ThemeType>;
