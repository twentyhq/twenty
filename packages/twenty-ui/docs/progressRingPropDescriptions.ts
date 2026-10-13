import { type ComponentProps } from 'react';

import { type ProgressRing } from '../src/primitives/feedback/ProgressRing/ProgressRing';

export const PROGRESS_RING_PROP_DESCRIPTIONS = {
  value:
    'Controlled value in the min/max range. Use null for indeterminate progress.',
  min: 'Inclusive minimum. Defaults to 0.',
  max: 'Inclusive maximum. Defaults to 100.',
  size: 'Ring diameter: sm (14px) or md (16px). Defaults to md.',
  barColor: 'CSS color of the filled arc. Defaults to the blue theme color.',
  children:
    'Optional preformatted value or Progress parts displayed before the ring.',
  'aria-label': 'Accessible name identifying the measured operation.',
  'aria-labelledby': 'ID of the visible label that names the operation.',
  'aria-valuetext':
    'Human-readable progress value overriding the default formatted value.',
  format:
    'Intl.NumberFormat options for the clamped numeric value. The default displays the normalized percentage.',
  locale:
    'Locale or locale list used to format the value. Defaults to the runtime locale.',
  getAriaValueText:
    'Receives the formatted value and raw value, including null, and returns an accessible value description.',
  className:
    'Class applied to the progress root, or a callback receiving its status.',
  style:
    'Inline styles applied to the progress root, or a callback receiving its status.',
  ref: 'Ref to the root div, or the element composed through render.',
  render:
    'Composes the root with an element or render callback. Forward the supplied props and ref to retain progress semantics.',
} satisfies Partial<Record<keyof ComponentProps<typeof ProgressRing>, string>>;
