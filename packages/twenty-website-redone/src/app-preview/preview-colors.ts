import { APP_PREVIEW_THEME } from '@/tokens/app-preview/app-preview-theme';

// The mockup's semantic color names (the shape the ported components were
// authored against), resolved from the product-derived theme. Single source:
// nothing in app-preview/ reaches past this and the stage tokens.
export const PREVIEW_COLORS: Record<string, string> = {
  accent: APP_PREVIEW_THEME.accent.accent9,
  accentBorder: APP_PREVIEW_THEME.border.color.blue,
  accentSurface: APP_PREVIEW_THEME.accent.primary,
  accentSurfaceSoft: APP_PREVIEW_THEME.background.transparent.blue,
  background: APP_PREVIEW_THEME.background.primary,
  backgroundSecondary: APP_PREVIEW_THEME.background.secondary,
  border: APP_PREVIEW_THEME.border.color.medium,
  borderLight: APP_PREVIEW_THEME.border.color.light,
  borderStrong: APP_PREVIEW_THEME.border.color.strong,
  text: APP_PREVIEW_THEME.font.color.primary,
  textLight: APP_PREVIEW_THEME.font.color.light,
  textSecondary: APP_PREVIEW_THEME.font.color.secondary,
  textTertiary: APP_PREVIEW_THEME.font.color.tertiary,
  textExtraLight: APP_PREVIEW_THEME.font.color.extraLight,
  transparentLight: APP_PREVIEW_THEME.background.transparent.light,
  transparentLighter: APP_PREVIEW_THEME.background.transparent.lighter,
  transparentMedium: APP_PREVIEW_THEME.background.transparent.medium,
  transparentStrong: APP_PREVIEW_THEME.background.transparent.strong,
  transparentPrimary: APP_PREVIEW_THEME.background.transparent.primary,
};
