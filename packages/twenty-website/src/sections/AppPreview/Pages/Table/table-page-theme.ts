import { VISUAL_TOKENS } from '../../Shared/utils/app-preview-tokens';

export const TABLE_PAGE_FONT = VISUAL_TOKENS.font.family;
export const TABLE_PAGE_CELL_HORIZONTAL_PADDING = 8;
export const TABLE_PAGE_HOVER_ACTION_EDGE_INSET = 4;
export const TABLE_PAGE_TABLER_STROKE = 1.6;

export const TABLE_PAGE_COLORS = {
  accentBorder: VISUAL_TOKENS.border.color.blue,
  accentSurface: VISUAL_TOKENS.accent.primary,
  accentSurfaceSoft: VISUAL_TOKENS.background.transparent.blue,
  background: VISUAL_TOKENS.background.primary,
  backgroundSecondary: VISUAL_TOKENS.background.secondary,
  border: VISUAL_TOKENS.border.color.medium,
  borderLight: VISUAL_TOKENS.border.color.light,
  borderStrong: VISUAL_TOKENS.border.color.strong,
  text: VISUAL_TOKENS.font.color.primary,
  textSecondary: VISUAL_TOKENS.font.color.secondary,
  textTertiary: VISUAL_TOKENS.font.color.tertiary,
} as const;
