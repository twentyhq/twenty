import { describe, expect, it } from 'vitest';

import { THEME_DARK } from '../constants/ThemeDark';
import { THEME_LIGHT } from '../constants/ThemeLight';
import { getAccentCssVariables } from '../internal/getAccentCssVariables';

const THEME_BY_COLOR_SCHEME = { light: THEME_LIGHT, dark: THEME_DARK };

const resolveColorReference = ({
  reference,
  colorScheme,
}: {
  reference: string;
  colorScheme: 'light' | 'dark';
}) => {
  const theme = THEME_BY_COLOR_SCHEME[colorScheme];
  const [, isTransparent, colorKey = ''] =
    reference.match(/^var\(--t-color-(transparent-)?([a-z]+\d+)\)$/) ?? [];

  const colors = (
    isTransparent ? theme.color.transparent : theme.color
  ) as Record<string, string>;

  return colors[colorKey];
};

describe('getAccentCssVariables', () => {
  it.each(['light', 'dark'] as const)(
    'reproduces the default accent tokens from the blue palette in %s mode',
    (colorScheme) => {
      const accentTokens = THEME_BY_COLOR_SCHEME[colorScheme].accent as Record<
        string,
        string
      >;

      for (const [cssVariable, reference] of Object.entries(
        getAccentCssVariables({ accentColor: 'blue', colorScheme }),
      )) {
        const accentKey = cssVariable.replace('--t-accent-', '');

        expect(resolveColorReference({ reference, colorScheme })).toBe(
          accentTokens[accentKey],
        );
      }
    },
  );

  it('covers every accent token', () => {
    const accentKeys = Object.keys(
      getAccentCssVariables({
        accentColor: 'red',
        colorScheme: 'light',
      }),
    ).map((cssVariable) => cssVariable.replace('--t-accent-', ''));

    expect(accentKeys.sort()).toEqual(Object.keys(THEME_LIGHT.accent).sort());
  });
});
