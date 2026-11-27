import { DEFAULT_THEME_COLOR_FALLBACK } from '@ui/theme';

import { parseThemeColor } from '../parseThemeColor';

describe('parseThemeColor', () => {
  it('should return a known theme color', () => {
    expect(parseThemeColor('turquoise')).toBe('turquoise');
  });

  it('should fall back for an unknown, empty or missing color', () => {
    expect(parseThemeColor('blue8')).toBe(DEFAULT_THEME_COLOR_FALLBACK);
    expect(parseThemeColor('')).toBe(DEFAULT_THEME_COLOR_FALLBACK);
    expect(parseThemeColor(null)).toBe(DEFAULT_THEME_COLOR_FALLBACK);
    expect(parseThemeColor(undefined)).toBe(DEFAULT_THEME_COLOR_FALLBACK);
  });
});
