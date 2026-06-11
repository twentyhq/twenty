import { APP_PREVIEW_THEME } from '@/tokens/app-preview/app-preview-theme';
import { APP_PREVIEW_TONES } from '@/tokens/app-preview/app-preview-tones';

// The workflow canvas vocabulary: authored inks from the tones home,
// chrome from the product-derived theme.
export const WORKFLOW_THEME = {
  canvasWidthPx: 1480,
  canvasHeightPx: 1260,
  nodeHeightPx: 48,
  canvasTopOffsetPx: 16,
  colors: {
    activeBadgeBackground:
      APP_PREVIEW_TONES.workflowCanvas.activeBadgeBackground,
    activeBadgeText: APP_PREVIEW_TONES.workflowCanvas.activeBadgeText,
    arrowStroke: APP_PREVIEW_TONES.workflowCanvas.arrowStroke,
    canvasBackground: APP_PREVIEW_THEME.background.primary,
    canvasDot: APP_PREVIEW_THEME.border.color.medium,
    nodeActionIcon: APP_PREVIEW_TONES.workflowCanvas.actionIcon,
    nodeTriggerIcon: APP_PREVIEW_TONES.workflowCanvas.triggerIcon,
    nodeIconFallback: APP_PREVIEW_THEME.font.color.secondary,
    nodeBorder: APP_PREVIEW_THEME.border.color.strong,
    nodeSurface: APP_PREVIEW_THEME.background.secondary,
    nodeIconSurface: APP_PREVIEW_THEME.background.transparent.light,
    textPrimary: APP_PREVIEW_THEME.font.color.primary,
    textLight: APP_PREVIEW_THEME.font.color.light,
    textTertiary: APP_PREVIEW_THEME.font.color.tertiary,
  },
};
