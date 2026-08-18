import {
  CANVAS_THEME_DARK_DEFAULTS,
  CANVAS_THEME_DEFAULTS,
} from '../canvas-theme';
import { getCanvasThemeForColorScheme } from '../get-canvas-theme-for-color-scheme';
import { resolveCanvasTheme } from '../resolve-canvas-theme';

describe('resolveCanvasTheme', () => {
  it('should fall back to the dark defaults when the document predates dark mode', () => {
    const theme = resolveCanvasTheme({ pageBackground: '#f4f4f5' });

    expect(theme?.pageBackground).toBe('#f4f4f5');
    expect(theme?.dark).toEqual(CANVAS_THEME_DARK_DEFAULTS);
  });

  it('should keep dark defaults for the colors the document does not override', () => {
    const theme = resolveCanvasTheme({ dark: { textColor: '#eeeeee' } });

    expect(theme?.dark).toEqual({
      ...CANVAS_THEME_DARK_DEFAULTS,
      textColor: '#eeeeee',
    });
  });

  it('should ignore a dark attribute that is not a color map', () => {
    expect(resolveCanvasTheme({ dark: 'nope' })?.dark).toEqual(
      CANVAS_THEME_DARK_DEFAULTS,
    );
  });

  it('should return null for non object values', () => {
    expect(resolveCanvasTheme(null)).toBeNull();
    expect(resolveCanvasTheme([])).toBeNull();
  });
});

describe('getCanvasThemeForColorScheme', () => {
  it('should apply the dark colors while keeping the shared geometry', () => {
    const darkTheme = getCanvasThemeForColorScheme(
      CANVAS_THEME_DEFAULTS,
      'dark',
    );

    expect(darkTheme.pageBackground).toBe(
      CANVAS_THEME_DARK_DEFAULTS.pageBackground,
    );
    expect(darkTheme.textColor).toBe(CANVAS_THEME_DARK_DEFAULTS.textColor);
    expect(darkTheme.width).toBe(CANVAS_THEME_DEFAULTS.width);
    expect(darkTheme.padding).toBe(CANVAS_THEME_DEFAULTS.padding);
  });

  it('should leave the theme untouched for the light scheme', () => {
    expect(getCanvasThemeForColorScheme(CANVAS_THEME_DEFAULTS, 'light')).toBe(
      CANVAS_THEME_DEFAULTS,
    );
  });
});
