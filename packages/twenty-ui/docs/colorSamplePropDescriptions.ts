import { type ColorSampleProps } from '../src/primitives/data-display/ColorSample/types/ColorSampleProps';

export const COLOR_SAMPLE_PROP_DESCRIPTIONS = {
  colorName:
    'Theme color used for the background and border. Required even when `color` overrides the background.',
  color:
    'CSS color that overrides the background; the border still uses `colorName`.',
  variant:
    'Generic swatch shape: `default` or `circle`. Omitting it uses the default shape.',
  className: 'CSS class merged with the swatch class.',
  style:
    'Native styles merged with the swatch color defaults. Explicit styles win.',
  ref: 'Ref to the swatch div, or the element supplied through render.',
  render: 'Element or render callback composed through Base UI useRender.',
  'aria-hidden':
    'Mark decorative swatches as hidden from assistive technology.',
  'aria-label': 'Accessible name when the caller supplies role="img".',
} satisfies Partial<Record<keyof ColorSampleProps, string>>;
