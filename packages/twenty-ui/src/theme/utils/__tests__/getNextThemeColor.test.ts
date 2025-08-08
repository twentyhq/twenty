import {
  MAIN_COLOR_NAMES,
  type ThemeColor,
} from '@ui/theme/constants/MainColorNames';

import { getNextThemeColor } from '../getNextThemeColor';

describe('getNextThemeColor', () => {
  it('returns the next theme color', () => {
    const currentColor: ThemeColor = MAIN_COLOR_NAMES[0];
    const nextColor: ThemeColor = MAIN_COLOR_NAMES[1];

    expect(getNextThemeColor(currentColor)).toBe(nextColor);
  });

  it('returns the first color when reaching the end', () => {
    const currentColor: ThemeColor =
      MAIN_COLOR_NAMES[MAIN_COLOR_NAMES.length - 1];
    const nextColor: ThemeColor = MAIN_COLOR_NAMES[0];

    expect(getNextThemeColor(currentColor)).toBe(nextColor);
  });
  it('returns the first color when currentColorIsUndefined', () => {
    const firstColor: ThemeColor = MAIN_COLOR_NAMES[0];

    expect(getNextThemeColor(undefined)).toBe(firstColor);
  });
});
