import { CANVAS_THEME_DEFAULTS, type CanvasTheme } from './canvas-theme';
import { isCanvasTheme } from './is-canvas-theme';

export const resolveCanvasTheme = (value: unknown): CanvasTheme | null =>
  isCanvasTheme(value) ? { ...CANVAS_THEME_DEFAULTS, ...value } : null;
