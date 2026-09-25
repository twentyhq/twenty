import { type ComponentProps } from 'react';

import { type CircularProgressBar } from '../src/primitives/feedback/CircularProgressBar/CircularProgressBar';

export const CIRCULAR_PROGRESS_BAR_PROP_DESCRIPTIONS = {
  size: 'Width and height of the spinner in pixels.',
  barWidth: 'Stroke width in pixels. Keep it smaller than half of `size`.',
  barColor: 'CSS stroke color. Defaults to the inherited text color.',
} satisfies Partial<
  Record<keyof ComponentProps<typeof CircularProgressBar>, string>
>;
