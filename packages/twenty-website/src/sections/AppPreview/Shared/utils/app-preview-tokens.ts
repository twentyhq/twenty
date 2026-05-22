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
    noisy: 'url("/images/shared/light-noise.webp")',
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
    light: '0px 2px 4px rgba(0, 0, 0, 0.04), 0px 0px 4px rgba(0, 0, 0, 0.08)',
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
