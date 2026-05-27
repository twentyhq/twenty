import type { SidebarIcon } from '../../types';

const SIDEBAR_TONES: Record<string, { color: string }> = {
  amber: { color: '#35290F' },
  blue: { color: '#3A5CCC' },
  gray: { color: '#838383' },
  green: { color: '#153226' },
  orange: { color: '#ED5F00' },
  pink: { color: '#a51853' },
  purple: { color: '#4f46e5' },
  red: { color: '#DC3D43' },
  teal: { color: '#0E9888' },
  violet: { color: '#5b3fd1' },
};

const hexToRgbTuple = (hex: string): string => {
  const clean = hex.replace('#', '');
  const expanded =
    clean.length === 3
      ? clean
          .split('')
          .map((char) => char + char)
          .join('')
      : clean;
  const value = parseInt(expanded, 16);
  return `${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}`;
};

const SIDEBAR_TONE_RGB: Record<string, string> = Object.fromEntries(
  Object.entries(SIDEBAR_TONES).map(([tone, palette]) => [
    tone,
    hexToRgbTuple(palette.color),
  ]),
);

export function getSidebarIconToneRgb(icon: SidebarIcon): string {
  const iconTone =
    'tone' in icon && typeof icon.tone === 'string' ? icon.tone : 'gray';

  return SIDEBAR_TONE_RGB[iconTone] ?? SIDEBAR_TONE_RGB.gray;
}
