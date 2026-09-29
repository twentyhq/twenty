import { type ComponentProps } from 'react';

import { type ProgressBar } from '../src/primitives/feedback/ProgressBar/ProgressBar';

export const PROGRESS_BAR_PROP_DESCRIPTIONS = {
  value: 'Current progress from 0 to 100.',
  className: 'CSS class applied to the progress root.',
  barColor: 'CSS color of the filled bar. Defaults to the primary text color.',
  backgroundColor: 'CSS background color of the track.',
  withBorderRadius: 'Rounds the track and indicator corners.',
  ariaLabel: 'Accessible name describing the operation being measured.',
} satisfies Partial<Record<keyof ComponentProps<typeof ProgressBar>, string>>;
