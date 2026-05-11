import { VISUAL_TOKENS } from '../../Shared/utils/app-preview-tokens';

export const KANBAN_PAGE_FONT = VISUAL_TOKENS.font.family;
export const KANBAN_PAGE_TABLER_STROKE = 1.6;
export const KANBAN_LANE_WIDTH = 206.4;

export const KANBAN_PAGE_COLORS = {
  accentBorder: VISUAL_TOKENS.border.color.blue,
  accentSurfaceSoft: VISUAL_TOKENS.background.transparent.blue,
  background: VISUAL_TOKENS.background.primary,
  backgroundSecondary: VISUAL_TOKENS.background.secondary,
  border: VISUAL_TOKENS.border.color.medium,
  borderLight: VISUAL_TOKENS.border.color.light,
  borderStrong: VISUAL_TOKENS.border.color.strong,
  shadow: VISUAL_TOKENS.boxShadow.light,
  text: VISUAL_TOKENS.font.color.primary,
  textLight: VISUAL_TOKENS.font.color.light,
  textSecondary: VISUAL_TOKENS.font.color.secondary,
  textTertiary: VISUAL_TOKENS.font.color.tertiary,
} as const;

export const KANBAN_LANE_TONES: Record<
  string,
  { background: string; color: string }
> = {
  blue: { background: '#def4ff', color: '#007bb8' },
  gray: { background: '#f3f1ef', color: '#666666' },
  green: { background: '#dcf7ed', color: '#1a7f50' },
  pink: { background: '#fce5f3', color: '#d6409f' },
  purple: { background: '#ede9fe', color: '#8e4ec6' },
};
