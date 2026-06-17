import { THEME_LIGHT } from 'twenty-ui/theme';
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
    canvasBackground: THEME_LIGHT.background.primary,
    canvasDot: THEME_LIGHT.border.color.medium,
    nodeActionIcon: APP_PREVIEW_TONES.workflowCanvas.actionIcon,
    nodeTriggerIcon: APP_PREVIEW_TONES.workflowCanvas.triggerIcon,
    nodeIconFallback: THEME_LIGHT.font.color.secondary,
    nodeBorder: THEME_LIGHT.border.color.strong,
    nodeSurface: THEME_LIGHT.background.secondary,
    nodeIconSurface: THEME_LIGHT.background.transparent.light,
    textPrimary: THEME_LIGHT.font.color.primary,
    textLight: THEME_LIGHT.font.color.light,
    textTertiary: THEME_LIGHT.font.color.tertiary,
  },
};
