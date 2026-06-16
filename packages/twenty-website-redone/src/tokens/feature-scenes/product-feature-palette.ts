// The product feature tiles' shared LIGHT theme — twenty-front's real product
// surfaces, borders, text, accent, tag tones and shadows (P3, mirrored from the
// drift-checked app-preview theme so the visuals stay self-contained: only this
// palette and the shared assets are common; every visual's JSX is its own, so a
// locked visual can never regress from a change elsewhere).
export const PRODUCT_FEATURE_PALETTE = {
  font: "'Inter', sans-serif",

  background: 'color(display-p3 1 1 1)',
  panelBackground: 'color(display-p3 0.988 0.988 0.988)',
  sunkenBackground: 'color(display-p3 0.945 0.945 0.945)',
  rowHoverBackground: 'color(display-p3 0 0 0 / 0.039)',

  border: 'color(display-p3 0.922 0.922 0.922)',
  borderLight: 'color(display-p3 0.945 0.945 0.945)',
  borderStrong: 'color(display-p3 0.839 0.839 0.839)',

  textPrimary: 'color(display-p3 0.2 0.2 0.2)',
  textSecondary: 'color(display-p3 0.4 0.4 0.4)',
  textTertiary: 'color(display-p3 0.6 0.6 0.6)',
  textLight: 'color(display-p3 0.702 0.702 0.702)',

  // accent9 == #3e63dd (twenty-front indigo) — NOT the site blue.
  accent: 'color(display-p3 0.276 0.384 0.837)',
  accentSurface: 'color(display-p3 0.831 0.87 1)',
  accentBorder: 'color(display-p3 0.685 0.74 0.957)',
  accentSurfaceSoft: '#0047f112',

  shadow: {
    light:
      '0px 2px 4px 0px color(display-p3 0 0 0 / 0.039), 0px 0px 4px 0px color(display-p3 0 0 0 / 0.078)',
    strong:
      '2px 4px 16px 0px color(display-p3 0 0 0 / 0.161), 0px 2px 4px 0px color(display-p3 0 0 0 / 0.078)',
  },

  trafficDots: {
    close: '#ff5f57',
    minimize: '#ffbd2e',
    zoom: '#28c840',
  },

  // twenty-front TAG_LIGHT: color3 background on color11 text, per tone.
  tones: {
    gray: {
      background: 'color(display-p3 0.976 0.976 0.976)',
      text: 'color(display-p3 0.4 0.4 0.4)',
    },
    blue: {
      background: 'color(display-p3 0.933 0.948 0.992)',
      text: 'color(display-p3 0.256 0.354 0.755)',
    },
    green: {
      background: 'color(display-p3 0.913 0.964 0.925)',
      text: 'color(display-p3 0.19 0.5 0.32)',
    },
    amber: {
      background: 'color(display-p3 0.994 0.969 0.782)',
      text: 'color(display-p3 0.64 0.4 0)',
    },
    orange: {
      background: 'color(display-p3 0.989 0.938 0.85)',
      text: 'color(display-p3 0.76 0.34 0)',
    },
    pink: {
      background: 'color(display-p3 0.981 0.917 0.96)',
      text: 'color(display-p3 0.698 0.219 0.528)',
    },
    purple: {
      background: 'color(display-p3 0.963 0.931 0.989)',
      text: 'color(display-p3 0.473 0.281 0.687)',
    },
    red: {
      background: 'color(display-p3 0.985 0.925 0.925)',
      text: 'color(display-p3 0.744 0.234 0.222)',
    },
    teal: {
      background: 'color(display-p3 0.895 0.971 0.952)',
      text: 'color(display-p3 0.08 0.5 0.43)',
    },
    yellow: {
      background: 'color(display-p3 0.997 0.982 0.749)',
      text: 'color(display-p3 0.6 0.44 0)',
    },
  },
};
