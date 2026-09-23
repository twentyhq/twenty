import { DEFAULT_THEME_COLOR_FALLBACK, MAIN_COLOR_NAMES } from '@ui/theme';
import { parseThemeColor } from '@ui/utilities/color/utils/parseThemeColor';

describe('parseThemeColor', () => {
  it.each(MAIN_COLOR_NAMES)('preserves the canonical color %s', (color) => {
    expect(parseThemeColor(color)).toBe(color);
  });

  it.each(['', 'invalid', 'Blue', ' blue ', 'blue9', '#0091ff'])(
    'returns the fallback for invalid color %j',
    (color) => {
      expect(parseThemeColor(color)).toBe(DEFAULT_THEME_COLOR_FALLBACK);
    },
  );

  it.each([null, undefined])('returns the fallback for %s', (color) => {
    expect(parseThemeColor(color)).toBe(DEFAULT_THEME_COLOR_FALLBACK);
  });
});
