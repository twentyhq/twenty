import { type ComponentProps } from 'react';

import { type Collapsible } from '../src/primitives/layout/Collapsible/Collapsible';

export const COLLAPSIBLE_PROP_DESCRIPTIONS = {
  children: 'Content inside the expanding panel.',
  isExpanded:
    'Controlled visibility of the panel. The application owns the trigger and state.',
  dimension: 'Dimension animated when the panel opens and closes.',
  animationDurations:
    'Default theme timing or separate opacity and size durations in seconds.',
  containAnimation:
    'Clips overflowing content during expansion and uses a column layout.',
  duration:
    'Theme timing preset for both opacity and size. Explicit `animationDurations` take precedence.',
} satisfies Partial<Record<keyof ComponentProps<typeof Collapsible>, string>>;
