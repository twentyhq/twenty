import { type ComponentProps } from 'react';

import { type TintedIconTile } from '../src/components/data-display/TintedIconTile/TintedIconTile';

export const TINTED_ICON_TILE_PROP_DESCRIPTIONS = {
  Icon: 'Icon component rendered inside the tinted tile.',
  color:
    'Theme palette name used to derive the background and icon shades. Invalid names use the default theme color.',
  size: 'Icon and tile dimension in pixels. When omitted, the icon uses the medium theme size.',
  stroke: 'Icon stroke width. Defaults to the medium theme stroke.',
} satisfies Partial<
  Record<keyof ComponentProps<typeof TintedIconTile>, string>
>;
