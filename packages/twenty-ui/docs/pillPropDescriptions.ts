import { type ComponentProps } from 'react';

import { type Pill } from '../src/primitives/data-display/Pill/Pill';

export const PILL_PROP_DESCRIPTIONS = {
  label: 'Short text displayed inside the pill.',
  Icon: 'Icon component rendered before the label at 12px. Import icons from `twenty-ui/icon`.',
  className: 'CSS class applied to the pill.',
  size: 'Pill size. `md` uses a larger font, height and icon.',
  color:
    'Text color. `inherit` takes the parent color and font weight on a tinted background.',
} satisfies Partial<Record<keyof ComponentProps<typeof Pill>, string>>;
