import { type ComponentProps } from 'react';

import { type ColorSample } from '../src/primitives/data-display/ColorSample/ColorSample';

export const COLOR_SAMPLE_PROP_DESCRIPTIONS = {
  colorName:
    'Theme color used for the background and border. Required even when `color` overrides the background.',
  color:
    'CSS color that overrides the background; the border still uses `colorName`.',
  variant:
    'Swatch shape: `default`, `circle`, or `pipeline`. Omitting it uses the default shape.',
  className: 'CSS class applied to the swatch.',
} satisfies Partial<Record<keyof ComponentProps<typeof ColorSample>, string>>;
