import { VISUAL_TOKENS } from '../../Shared/utils/home-visual-tokens';

export const WORKFLOW_PAGE_FONT = VISUAL_TOKENS.font.family;
export const WORKFLOW_PAGE_TABLER_STROKE = 1.6;
export const WORKFLOW_CANVAS_WIDTH = 1480;
export const WORKFLOW_CANVAS_HEIGHT = 1260;
export const WORKFLOW_NODE_HEIGHT = 48;
export const WORKFLOW_CANVAS_TOP_OFFSET = 16;

export const WORKFLOW_PAGE_COLORS = {
  activeBadgeBackground: '#dff3e6',
  activeBadgeText: '#228b52',
  arrowStroke: '#d8d2cb',
  canvasBackground: '#ffffff',
  canvasDot: '#ebebeb',
  nodeActionIcon: '#FF6B5F',
  nodeTriggerIcon: '#4A67F6',
  nodeIconFallback: VISUAL_TOKENS.font.color.secondary,
  nodeBorder: VISUAL_TOKENS.border.color.strong,
  nodeSurface: VISUAL_TOKENS.background.secondary,
  nodeIconSurface: VISUAL_TOKENS.background.transparent.light,
  textPrimary: VISUAL_TOKENS.font.color.primary,
  textTertiary: VISUAL_TOKENS.font.color.tertiary,
} as const;
