import {
  CANVAS_THEME_COLOR_PROPERTIES,
  CANVAS_THEME_DARK_DEFAULTS,
  CANVAS_THEME_DEFAULTS,
  type CanvasTheme,
  type CanvasThemeColors,
} from './canvas-theme';
import { isCanvasTheme } from './is-canvas-theme';

const resolveDarkCanvasThemeColors = (value: unknown): CanvasThemeColors => {
  if (!isCanvasTheme(value)) {
    return CANVAS_THEME_DARK_DEFAULTS;
  }

  const colors = { ...CANVAS_THEME_DARK_DEFAULTS };

  for (const property of CANVAS_THEME_COLOR_PROPERTIES) {
    const override = value[property];

    if (typeof override === 'string') {
      colors[property] = override;
    }
  }

  return colors;
};

export const resolveCanvasTheme = (value: unknown): CanvasTheme | null =>
  isCanvasTheme(value)
    ? {
        ...CANVAS_THEME_DEFAULTS,
        ...value,
        dark: resolveDarkCanvasThemeColors(value.dark),
      }
    : null;
