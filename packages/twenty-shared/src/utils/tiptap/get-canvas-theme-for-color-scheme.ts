import { type CanvasTheme, type CanvasThemeColorScheme } from './canvas-theme';

export const getCanvasThemeForColorScheme = (
  theme: CanvasTheme,
  colorScheme: CanvasThemeColorScheme,
): CanvasTheme =>
  colorScheme === 'dark' ? { ...theme, ...theme.dark } : theme;
