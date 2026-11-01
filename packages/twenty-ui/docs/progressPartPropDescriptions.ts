import { type ComponentProps } from 'react';

import { type Progress } from '../src/primitives/feedback/Progress/Progress';

const PROGRESS_COMMON_PROP_DESCRIPTIONS = {
  className:
    'Class applied to this part, or a callback receiving its progress status.',
  style:
    'Inline styles applied to this part, or a callback receiving its progress status.',
  render:
    'Composes this part with an element or render callback. Forward the supplied props and ref to the corresponding DOM element.',
};

export const PROGRESS_PART_PROP_DESCRIPTIONS = {
  Root: {
    ...PROGRESS_COMMON_PROP_DESCRIPTIONS,
    value:
      'Controlled value in the min/max range. Use null for indeterminate progress.',
    min: 'Inclusive minimum. Defaults to 0.',
    max: 'Inclusive maximum. Defaults to 100.',
    format:
      'Intl.NumberFormat options for the clamped numeric value. The default displays the normalized percentage.',
    locale:
      'Locale or locale list used to format the value. Defaults to the runtime locale.',
    getAriaValueText:
      'Receives the formatted value and raw value, including null, and returns an accessible value description.',
    children: 'Composed Progress parts and supporting content.',
    'aria-label': 'Accessible name identifying the measured operation.',
    'aria-labelledby': 'ID of the visible label that names the operation.',
    'aria-valuetext':
      'Human-readable progress value overriding the default formatted value.',
    ref: 'Ref to the root div, or the element composed through Root.render.',
  } satisfies Partial<
    Record<keyof ComponentProps<typeof Progress.Root>, string>
  >,
  Track: {
    ...PROGRESS_COMMON_PROP_DESCRIPTIONS,
    children: 'The indicator and optional supporting content.',
    ref: 'Ref to the track div, or the element composed through Track.render.',
  } satisfies Partial<
    Record<keyof ComponentProps<typeof Progress.Track>, string>
  >,
  Indicator: {
    ...PROGRESS_COMMON_PROP_DESCRIPTIONS,
    ref: 'Ref to the indicator div, or the element composed through Indicator.render.',
  } satisfies Partial<
    Record<keyof ComponentProps<typeof Progress.Indicator>, string>
  >,
  Label: {
    ...PROGRESS_COMMON_PROP_DESCRIPTIONS,
    children: 'Visible text that supplies the accessible name of the root.',
    ref: 'Ref to the label span, or the element composed through Label.render.',
  } satisfies Partial<
    Record<keyof ComponentProps<typeof Progress.Label>, string>
  >,
  Value: {
    ...PROGRESS_COMMON_PROP_DESCRIPTIONS,
    children:
      'Optional callback receiving the formatted value and raw value. Indeterminate progress passes indeterminate as formatted text. Without a callback, indeterminate progress displays no content.',
    ref: 'Ref to the value span, or the element composed through Value.render.',
  } satisfies Partial<
    Record<keyof ComponentProps<typeof Progress.Value>, string>
  >,
};
