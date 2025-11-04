import { MAIN_COLORS_LIGHT } from './MainColorsLight';

export const MAIN_COLOR_NAMES = Object.keys(MAIN_COLORS_LIGHT) as ThemeColor[];

export type ThemeColor = keyof typeof MAIN_COLORS_LIGHT;
