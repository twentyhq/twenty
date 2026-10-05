import { type ComponentProps } from 'react';

import { type HorizontalSeparator } from '../src/primitives/layout/HorizontalSeparator/HorizontalSeparator';

export const HORIZONTAL_SEPARATOR_PROP_DESCRIPTIONS = {
  visible:
    'Shows the dividing line. Setting it to false preserves margins and any text.',
  text: 'Optional label displayed between two lines.',
  noMargin: 'Removes the vertical margins.',
  color:
    'CSS color for the line and text. Defaults to the medium border color.',
  textPosition:
    'Places the text between two lines, or at the end of a single line.',
} satisfies Partial<
  Record<keyof ComponentProps<typeof HorizontalSeparator>, string>
>;
