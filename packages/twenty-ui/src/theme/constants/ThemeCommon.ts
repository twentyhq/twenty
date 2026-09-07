// Generated from design-tokens by scripts/generateThemeTokens.ts.
// Do not edit manually. Regenerate with: npx nx generateTokens twenty-ui.
import { themeSpacing } from '../internal/themeSpacing';

export const THEME_COMMON = {
  icon: {
    size: {
      sm: 14,
      md: 16,
      lg: 20,
      xl: 24,
    },
    stroke: {
      sm: 1.6,
      md: 2,
      lg: 2.5,
    },
  },
  modal: {
    size: {
      sm: {
        width: '300px',
      },
      md: {
        width: '400px',
      },
      lg: {
        width: '53%',
      },
      xl: {
        width: '1200px',
        height: '800px',
      },
      fullscreen: {
        width: 'calc(100dvw / var(--t-zoom, 1))',
        height: 'calc(100dvh / var(--t-zoom, 1))',
      },
    },
  },
  text: {
    lineHeight: {
      lg: 1.5,
      md: 1.1,
    },
    iconSizeMedium: 16,
    iconSizeSmall: 14,
    iconStrikeLight: 1.6,
    iconStrikeMedium: 2,
    iconStrikeBold: 2.5,
  },
  animation: {
    duration: {
      instant: 0.075,
      fast: 0.15,
      normal: 0.3,
      slow: 1.5,
    },
  },
  spacingMultiplicator: 4,
  spacing: themeSpacing,
  betweenSiblingsGap: '2px',
  table: {
    horizontalCellMargin: '8px',
    checkboxColumnWidth: '32px',
    horizontalCellPadding: '8px',
  },
  sidePanelWidth: '500px',
  clickableElementBackgroundTransition: 'background 0.1s ease',
  lastLayerZIndex: 2147483647,
  buttons: {
    secondaryTextColor: 'color(display-p3 0.63 0.69 1)',
  },
};
