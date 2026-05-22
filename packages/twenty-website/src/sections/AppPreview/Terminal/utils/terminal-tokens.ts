export const TERMINAL_TOKENS = {
  surface: {
    window: '#fefefd',
    windowBorder: 'rgba(0, 0, 0, 0.04)',
    topBarBorder: 'rgba(0, 0, 0, 0.06)',
    promptBoxBackground: 'rgba(0, 0, 0, 0.02)',
    promptBoxBackgroundHover: 'rgba(0, 0, 0, 0.03)',
    promptBoxBorder: 'rgba(0, 0, 0, 0.08)',
    promptBoxBorderFocus: 'rgba(0, 0, 0, 0.18)',
    toggleBackground: 'rgba(9, 9, 11, 0.04)',
    toggleBorder: 'rgba(9, 9, 11, 0.06)',
    activeSegmentBackground: '#ffffff',
    activeSegmentBorder: 'rgba(9, 9, 11, 0.06)',
    inactiveSegmentHoverBackground: 'rgba(9, 9, 11, 0.04)',
    chipBackground: '#eef4f1',
    chipBorder: '#d3dfd9',
    chipHoverBackground: '#e3ede7',
    mythosHoverBackground: 'rgba(0, 0, 0, 0.04)',
  },
  text: {
    primary: 'rgba(9, 9, 11, 0.92)',
    secondary: 'rgba(9, 9, 11, 0.55)',
    prompt: 'rgba(0, 0, 0, 0.8)',
    muted: 'rgba(0, 0, 0, 0.56)',
    mutedHover: 'rgba(0, 0, 0, 0.78)',
    chip: '#2f7468',
  },
  trafficLight: {
    close: '#FF5F57',
    closeActive: '#E0443E',
    minimize: '#FEBC2E',
    minimizeActive: '#DEA123',
    zoom: '#28C840',
    zoomActive: '#1AAB29',
    glyph: 'rgba(0, 0, 0, 0.55)',
  },
  accent: {
    brand: '#1961ed',
    brandHover: '#1550c5',
  },
  shadow: {
    activeSegment:
      '0 0 1px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  },
  font: {
    ui: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
    mono: "'Geist Mono', 'SF Mono', ui-monospace, Menlo, Monaco, Consolas, monospace",
  },
} as const;
