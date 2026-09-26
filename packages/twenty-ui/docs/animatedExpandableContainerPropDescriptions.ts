import { type ComponentProps } from 'react';

import { type AnimatedExpandableContainer } from '../src/primitives/layout/AnimatedExpandableContainer/AnimatedExpandableContainer';

export const ANIMATED_EXPANDABLE_CONTAINER_PROP_DESCRIPTIONS = {
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
  mode: 'Compatibility prop accepted by the type but not used by the current implementation.',
  initial:
    'Compatibility prop accepted by the type but not used by the current implementation.',
} satisfies Partial<
  Record<keyof ComponentProps<typeof AnimatedExpandableContainer>, string>
>;
