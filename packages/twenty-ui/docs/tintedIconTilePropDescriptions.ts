import { type ComponentProps } from 'react';

import { type TintedIconTile } from '../src/components/data-display/TintedIconTile/TintedIconTile';

export const TINTED_ICON_TILE_PROP_DESCRIPTIONS = {
  icon: 'Decorative icon content. The caller controls its dimensions and stroke.',
  color:
    'Theme palette name used to derive the background and foreground shades. Invalid names use the default theme color.',
  className: 'CSS class applied to the tile root.',
  style: 'Inline styles override tile geometry and palette defaults.',
  render:
    'Replaces the div root while preserving icon content and native props.',
} satisfies Partial<
  Record<keyof ComponentProps<typeof TintedIconTile>, string>
>;
