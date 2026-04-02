// Resolved CSS token values that replace twenty-ui's themeCssVariables.
// These are the light-theme defaults for Twenty's design system.
export const VISUAL_TOKENS = {
  font: {
    family: "'Inter', sans-serif",
    color: {
      primary: '#333333',
      secondary: '#666666',
      tertiary: '#999999',
      light: '#b3b3b3',
    },
    size: {
      md: '13px',
    },
    weight: {
      regular: '400',
      medium: '500',
    },
  },
  spacing: {
    0: '0px',
    1: '4px',
    2: '8px',
  },
  border: {
    color: {
      strong: '#d6d6d6',
      medium: '#ebebeb',
      light: '#f1f1f1',
      blue: '#c6d4f9',
    },
    radius: {
      sm: '4px',
      pill: '999px',
    },
  },
  background: {
    noisy:
      "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E\")",
    primary: '#ffffff',
    secondary: '#fcfcfc',
    transparent: {
      primary: 'rgba(255, 255, 255, 0.9)',
      medium: 'rgba(0, 0, 0, 0.04)',
      light: 'rgba(0, 0, 0, 0.03)',
      lighter: 'rgba(0, 0, 0, 0.02)',
      strong: 'rgba(0, 0, 0, 0.07)',
      blue: 'rgba(62, 99, 221, 0.04)',
    },
  },
  accent: {
    accent9: '#3e63dd',
    primary: '#d9e2fc',
  },
  boxShadow: {
    light:
      '0px 2px 4px rgba(0, 0, 0, 0.04), 0px 0px 4px rgba(0, 0, 0, 0.08)',
  },
  icon: {
    size: {
      sm: '14',
    },
    stroke: {
      sm: '1.6',
    },
  },
} as const;
