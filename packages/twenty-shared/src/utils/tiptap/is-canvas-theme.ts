import { type CanvasTheme } from './canvas-theme';

export const isCanvasTheme = (value: unknown): value is Partial<CanvasTheme> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
