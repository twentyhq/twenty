import { type ComponentProps } from 'react';

import { type DetailsRow } from '../src/components/data-display/DetailsRow/DetailsRow';

export const DETAILS_ROW_PROP_DESCRIPTIONS = {
  label: 'Visible label rendered as the description term.',
  children:
    'Value content rendered in the description definition. Text and multiple items wrap within the available space.',
  startIcon:
    'Decorative node before the label. The caller controls icon dimensions.',
  action:
    'Optional action content beside the value. The caller supplies controls, accessible names, and handlers.',
  labelWidth:
    'Preferred label column width. Numbers use pixels. The column is capped at 40% of the row width; use the same width for aligned sibling rows.',
  className: 'CSS class applied to the row root.',
  style: 'Inline styles applied to the row root.',
  ref: 'Ref forwarded to the row root div.',
  render:
    'Customizes the row root. Preserve a div directly inside a dl and forward its props and ref to retain valid description-list grouping.',
} satisfies Partial<Record<keyof ComponentProps<typeof DetailsRow>, string>>;
