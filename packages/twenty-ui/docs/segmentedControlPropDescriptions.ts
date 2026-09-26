import { type ComponentProps } from 'react';
import { type KeysOfUnion } from 'type-fest';

import { type SegmentedControl } from '../src/primitives/input/SegmentedControl/SegmentedControl';

export const SEGMENTED_CONTROL_PROP_DESCRIPTIONS = {
  itemWidth: 'Use equal-width options or size each option to its content.',
  options:
    'Options with a unique string `value`, a `label` or `startIcon`, and optional `disabled`. Icon-only options require an `aria-label`.',
  'aria-label': 'Accessible group name. Supply this or `aria-labelledby`.',
  'aria-labelledby':
    'ID of an element that labels the group. Supply this or `aria-label`.',
} satisfies Partial<
  Record<KeysOfUnion<ComponentProps<typeof SegmentedControl>>, string>
>;
