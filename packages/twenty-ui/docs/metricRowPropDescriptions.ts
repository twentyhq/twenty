import { type ComponentProps } from 'react';

import { type MetricRow } from '../src/components/data-display/MetricRow/MetricRow';

export const METRIC_ROW_PROP_DESCRIPTIONS = {
  children:
    'Label content whose accessible text also names the optional progress ring.',
  startIcon:
    'Decorative node content before the label. The caller controls icon geometry.',
  value:
    'Preformatted value displayed at the end of the row. String values also supply the progress ring accessible value text.',
  progress:
    'Optional controlled progress from 0 to 100. Omitting it displays the value without a ring.',
  progressColor: 'CSS color of the filled arc when progress is provided.',
  progressValueText:
    'Accessible value text for the progress ring. Overrides the string value fallback; supply it when formatted content needs more context than a percentage.',
  className: 'CSS class applied to the row root.',
  style: 'Inline styles applied to the row root.',
  render: 'Replaces the row root element while preserving its contents.',
} satisfies Partial<Record<keyof ComponentProps<typeof MetricRow>, string>>;
