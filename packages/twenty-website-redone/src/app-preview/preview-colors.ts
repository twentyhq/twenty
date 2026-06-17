import { THEME_LIGHT } from 'twenty-ui/theme';

// The mockup's semantic color names (the shape the ported components were
// authored against), resolved straight from twenty-ui's live theme — the
// single source of truth. Nothing in app-preview/ reaches past this and the
// stage tokens for color.
export const PREVIEW_COLORS: Record<string, string> = {
  accent: THEME_LIGHT.accent.accent9,
  accentBorder: THEME_LIGHT.border.color.blue,
  accentSurface: THEME_LIGHT.accent.primary,
  accentSurfaceSoft: THEME_LIGHT.background.transparent.blue,
  background: THEME_LIGHT.background.primary,
  backgroundSecondary: THEME_LIGHT.background.secondary,
  border: THEME_LIGHT.border.color.medium,
  borderLight: THEME_LIGHT.border.color.light,
  borderStrong: THEME_LIGHT.border.color.strong,
  text: THEME_LIGHT.font.color.primary,
  textLight: THEME_LIGHT.font.color.light,
  textSecondary: THEME_LIGHT.font.color.secondary,
  textTertiary: THEME_LIGHT.font.color.tertiary,
  textExtraLight: THEME_LIGHT.font.color.extraLight,
  transparentLight: THEME_LIGHT.background.transparent.light,
  transparentLighter: THEME_LIGHT.background.transparent.lighter,
  transparentMedium: THEME_LIGHT.background.transparent.medium,
  transparentStrong: THEME_LIGHT.background.transparent.strong,
  transparentPrimary: THEME_LIGHT.background.transparent.primary,
};
