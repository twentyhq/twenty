import { type ComponentProps } from 'react';

import { type ProgressRing } from '../src/primitives/feedback/ProgressRing/ProgressRing';

export const PROGRESS_RING_PROP_DESCRIPTIONS = {
  value:
    'Controlled progress from 0 to 100. Out-of-range values are bounded and NaN renders as zero.',
  size: 'Ring diameter: sm (14px) or md (16px). Defaults to md.',
  barColor: 'CSS color of the filled arc. Defaults to the blue theme color.',
  children: 'Optional preformatted value displayed before the ring.',
  'aria-label': 'Accessible name identifying the measured operation.',
  'aria-labelledby':
    'ID of the visible label that names the measured operation.',
  'aria-valuetext':
    'Human-readable progress value when a percentage alone is insufficient.',
  className: 'CSS class applied to the progress root.',
  style: 'Inline styles applied to the progress root.',
  render: 'Replaces the root element while preserving progress semantics.',
} satisfies Partial<Record<keyof ComponentProps<typeof ProgressRing>, string>>;
