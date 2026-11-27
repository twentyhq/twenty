import { type ThemeColor } from '../constants/MainColorNames';
import { ACCENT_SCALE_STEP_BY_CSS_VARIABLE } from './AccentScaleStepByCssVariable';
import { ACCENT_TRANSPARENT_STEP_BY_COLOR_SCHEME } from './AccentTransparentStepByColorScheme';

type GetAccentCssVariablesArgs = {
  accentColor: ThemeColor;
  colorScheme: 'light' | 'dark';
};

export const getAccentCssVariables = ({
  accentColor,
  colorScheme,
}: GetAccentCssVariablesArgs): Record<string, string> => ({
  ...Object.fromEntries(
    Object.entries(ACCENT_SCALE_STEP_BY_CSS_VARIABLE).map(
      ([cssVariable, step]) => [
        cssVariable,
        `var(--t-color-${accentColor}${step})`,
      ],
    ),
  ),
  '--t-accent-transparent': `var(--t-color-transparent-${accentColor}${ACCENT_TRANSPARENT_STEP_BY_COLOR_SCHEME[colorScheme]})`,
});
