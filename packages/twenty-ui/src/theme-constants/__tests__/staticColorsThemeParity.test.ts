import * as fs from 'fs';
import * as path from 'path';

import { STATIC_COLORS } from '@ui/theme/constants/StaticColors';
import { THEME_DARK } from '@ui/theme/constants/ThemeDark';
import { THEME_LIGHT } from '@ui/theme/constants/ThemeLight';
import { TOOLTIP } from '@ui/theme/constants/Tooltip';

import { themeCssVariables } from '../themeCssVariables';

const PALETTE_OPACITIES = {
  white: [
    0, 0.013, 0.034, 0.056, 0.086, 0.124, 0.176, 0.249, 0.386, 0.446, 0.592, 1,
  ],
  black: [
    0.012, 0.027, 0.047, 0.071, 0.08, 0.114, 0.141, 0.22, 0.36, 0.478, 0.72, 1,
  ],
};

const EXPECTED_COLORS = Object.fromEntries(
  Object.entries(PALETTE_OPACITIES).flatMap(([color, opacities]) =>
    opacities.map((opacity, index) => [
      `${color}${index + 1}`,
      `color(display-p3 ${color === 'white' ? '1 1 1' : '0 0 0'} / ${opacity})`,
    ]),
  ),
);

describe('static colors', () => {
  it('has exactly twelve canonical steps per palette in both themes', () => {
    expect(STATIC_COLORS).toEqual(EXPECTED_COLORS);
    expect(THEME_LIGHT.color.static).toEqual(EXPECTED_COLORS);
    expect(THEME_DARK.color.static).toEqual(EXPECTED_COLORS);
    expect(Object.keys(themeCssVariables.color.static)).toEqual(
      Object.keys(EXPECTED_COLORS),
    );
  });

  it('uses the fixed palette for tooltip colors in both themes', () => {
    expect(TOOLTIP).toEqual({
      background: STATIC_COLORS.black12,
      color: STATIC_COLORS.white12,
      descriptionColor: STATIC_COLORS.white11,
    });
    expect(THEME_LIGHT.tooltip).toEqual(TOOLTIP);
    expect(THEME_DARK.tooltip).toEqual(TOOLTIP);
  });
});

describe.each(['light', 'dark'])('%s theme CSS', (mode) => {
  const css = fs.readFileSync(
    path.resolve(__dirname, `../theme-${mode}.css`),
    'utf-8',
  );

  it.each(Object.entries(EXPECTED_COLORS))(
    'keeps %s in sync with the canonical palette and accessor',
    (color, value) => {
      expect(css).toContain(`--t-color-static-${color}: ${value};`);
      expect(themeCssVariables.color.static).toHaveProperty(
        color,
        `var(--t-color-static-${color})`,
      );
    },
  );

  it('aliases tooltip semantic tokens to the fixed palette', () => {
    expect(css).toContain(
      '--t-tooltip-background: var(--t-color-static-black12);',
    );
    expect(css).toContain('--t-tooltip-color: var(--t-color-static-white12);');
    expect(css).toContain(
      '--t-tooltip-description-color: var(--t-color-static-white11);',
    );
    expect(themeCssVariables.tooltip).toEqual({
      background: 'var(--t-tooltip-background)',
      color: 'var(--t-tooltip-color)',
      descriptionColor: 'var(--t-tooltip-description-color)',
    });
  });

  it('preserves the existing modal-overlay colors', () => {
    const overlays =
      mode === 'light'
        ? {
            primary: 'color(display-p3 0 0 0 / 0.722)',
            secondary: 'color(display-p3 0 0 0 / 0.361)',
            tertiary: 'color(display-p3 0 0 0 / 0.071)',
          }
        : {
            primary: '#000000b8',
            secondary: '#0000005c',
            tertiary: '#0000005c',
          };

    for (const [name, value] of Object.entries(overlays)) {
      expect(css).toContain(`--t-background-overlay-${name}: ${value};`);
    }
  });
});
