import { TERMINAL_TOKENS } from '../../utils/terminal-tokens';

const CloseGlyph = () => (
  <svg aria-hidden width="6" height="6" viewBox="0 0 6 6">
    <path
      d="M1 1 L5 5 M5 1 L1 5"
      stroke={TERMINAL_TOKENS.trafficLight.glyph}
      strokeWidth="1"
      strokeLinecap="round"
    />
  </svg>
);

const MinimizeGlyph = () => (
  <svg aria-hidden width="6" height="6" viewBox="0 0 6 6">
    <path
      d="M1 3 L5 3"
      stroke={TERMINAL_TOKENS.trafficLight.glyph}
      strokeWidth="1"
      strokeLinecap="round"
    />
  </svg>
);

const ZoomGlyph = () => (
  <svg aria-hidden width="6" height="6" viewBox="0 0 6 6">
    <path
      d="M1.5 1.5 L1.5 4.5 L4.5 4.5 Z M4.5 1.5 L1.5 4.5"
      fill={TERMINAL_TOKENS.trafficLight.glyph}
    />
  </svg>
);

export const TRAFFIC_LIGHT_DOT_DEFINITIONS = [
  {
    background: TERMINAL_TOKENS.trafficLight.close,
    backgroundActive: TERMINAL_TOKENS.trafficLight.closeActive,
    Glyph: CloseGlyph,
    label: 'Close',
  },
  {
    background: TERMINAL_TOKENS.trafficLight.minimize,
    backgroundActive: TERMINAL_TOKENS.trafficLight.minimizeActive,
    Glyph: MinimizeGlyph,
    label: 'Minimize',
  },
  {
    background: TERMINAL_TOKENS.trafficLight.zoom,
    backgroundActive: TERMINAL_TOKENS.trafficLight.zoomActive,
    Glyph: ZoomGlyph,
    label: 'Zoom',
  },
] as const;
