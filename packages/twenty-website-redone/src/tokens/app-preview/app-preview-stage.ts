// The mockup's marketing staging (authored, NOT product-derived): the
// window scene, frame geometry, and shadows the hero presents the product
// in. Values ported from the old AppPreviewFrame/window-shadows full reads.
export const APP_PREVIEW_STAGE = {
  frame: {
    maxWidthPx: 1040,
    aspectRatio: '1280 / 832',
    borderRadiusPx: 20,
    noiseImageUrl: '/images/shared/light-noise.webp',
  },
  windowScene: {
    widthPx: 1040,
    heightPx: 676,
  },
  windowBar: {
    background: '#F7F7F7',
    border: 'rgba(0, 0, 0, 0.05)',
    highlight: 'rgba(255, 255, 255, 0.65)',
    titleColor: 'rgba(40, 36, 30, 0.62)',
    verticalPaddingPx: 8,
    horizontalPaddingPx: 12,
    trafficLightSlotWidthPx: 52,
  },
  trafficLight: {
    close: '#FF5F57',
    closeActive: '#E0443E',
    minimize: '#FEBC2E',
    minimizeActive: '#DEA123',
    zoom: '#28C840',
    zoomActive: '#1AAB29',
    glyph: 'rgba(0, 0, 0, 0.55)',
    ring: 'rgba(0, 0, 0, 0.12)',
  },
  terminalFont: {
    ui: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
    mono: "'Geist Mono', 'SF Mono', ui-monospace, Menlo, Monaco, Consolas, monospace",
  },
  // The terminal hangs 148px past the 1040px scene's right edge; below
  // ~1350px viewport that overhang has no room, so the window only mounts
  // visually from there up (scene threshold, not a layout breakpoint).
  terminalRoomQuery: '@media (min-width: 1350px)',
  // The Cursor brand tile's authored artwork inks.
  cursorLogoInk: {
    tile: '#0b0b0b',
    faceTop: '#5e5e5e',
    faceLeft: '#3d3d3d',
    faceRight: '#2a2a2a',
    wingTop: '#ffffff',
    wingFront: '#dcdcdc',
  },
  // The pointing-hand hint's authored artwork inks.
  fingerHintInk: {
    fill: 'white',
    outline: '#202125',
  },
  shadow: {
    resting: '0 10px 64px 0 rgba(0, 0, 0, 0.2)',
    elevated:
      '0 14px 80px 0 rgba(0, 0, 0, 0.26), 0 4px 12px 0 rgba(0, 0, 0, 0.08)',
    floating: '0 36px 64px -8px rgba(0, 0, 0, 0.36)',
    mobileResting: '0 4px 16px 0 rgba(0, 0, 0, 0.08)',
    mobileElevated: '0 6px 20px 0 rgba(0, 0, 0, 0.12)',
    mobileFloating: '0 14px 28px -4px rgba(0, 0, 0, 0.17)',
  },
};
