import { type ComponentProps } from 'react';

import { type Pill } from '../src/primitives/data-display/Pill/Pill';

export const PILL_PROP_DESCRIPTIONS = {
  label: 'Short text displayed inside the pill.',
  Icon: 'Icon component rendered before the label at 12px. Import icons from `twenty-ui/icon`.',
  className: 'CSS class applied to the pill.',
} satisfies Partial<Record<keyof ComponentProps<typeof Pill>, string>>;
