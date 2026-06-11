// The mockup's tone tables, ported verbatim (single module — the old site
// scattered four copies). LEDGERED UPGRADE PENDING: derive from the
// product's TAG_LIGHT (color11 text on color3 background) as its own
// commit so the visual A/B judges the change in isolation.
type ToneSurface = { background: string; border: string; color: string };
type TonePair = { background: string; color: string };

const SIDEBAR: Record<string, ToneSurface> = {
  amber: { background: '#FEF2A4', border: '#FEF2A4', color: '#35290F' },
  blue: { background: '#d9e2fc', border: '#c6d4f9', color: '#3A5CCC' },
  gray: { background: '#ebebeb', border: '#d6d6d6', color: '#838383' },
  green: { background: '#ccebd7', border: '#bbe4c9', color: '#153226' },
  orange: { background: '#ffdcc3', border: '#ffcca7', color: '#ED5F00' },
  pink: { background: '#ffe1e7', border: '#ffc8d6', color: '#a51853' },
  purple: { background: '#e0e7ff', border: '#c7d2fe', color: '#4f46e5' },
  red: { background: '#fdd8d8', border: '#f9c6c6', color: '#DC3D43' },
  teal: { background: '#c7ebe5', border: '#afdfd7', color: '#0E9888' },
  violet: { background: '#ebe5ff', border: '#d8cbff', color: '#5b3fd1' },
};

const PERSON: Record<string, TonePair> = {
  amber: { background: '#f6e6d7', color: '#7a4f2a' },
  blue: { background: '#dbeafe', color: '#1d4ed8' },
  gray: { background: '#e5e7eb', color: '#4b5563' },
  green: { background: '#dcfce7', color: '#15803d' },
  orange: { background: '#ffdcc3', color: '#ED5F00' },
  pink: { background: '#ffe4e6', color: '#be123c' },
  purple: { background: '#ede9fe', color: '#6d28d9' },
  red: { background: '#fee2e2', color: '#b91c1c' },
  teal: { background: '#ccfbf1', color: '#0f766e' },
};

const TAG: Record<string, TonePair> = {
  amber: { background: '#FEF2A4', color: '#35290F' },
  blue: { background: '#d9e2fc', color: '#3a5ccc' },
  gray: { background: '#fafafa', color: '#666666' },
  green: { background: '#ccebd7', color: '#299764' },
  orange: { background: '#ffdcc3', color: '#ed5f00' },
  pink: { background: '#fcdced', color: '#d6409f' },
  purple: { background: '#eddbf9', color: '#8347b9' },
  red: { background: '#fdd8d8', color: '#dc3d43' },
  teal: { background: '#c7ebe5', color: '#0E9888' },
};

function hexToRgbTuple(hex: string): string {
  const clean = hex.replace('#', '');
  const expanded =
    clean.length === 3
      ? clean
          .split('')
          .map((char) => char + char)
          .join('')
      : clean;
  const value = Number.parseInt(expanded, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255].join(', ');
}

export const APP_PREVIEW_TONES = {
  sidebar: SIDEBAR,
  person: PERSON,
  tag: TAG,
  // The reveal pulse reads the tone as an `r, g, b` tuple string.
  sidebarToneRgb: (tone: string): string =>
    hexToRgbTuple((SIDEBAR[tone] ?? SIDEBAR.gray).color),
};
