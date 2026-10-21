import { type ComponentProps } from 'react';

import { type Icon } from '../src/icon/components/Icon';

export const ICON_PROP_DESCRIPTIONS = {
  name: 'Icon name resolved through IconsProvider. Unknown names fall back to Icon123.',
  className: 'Class forwarded to the resolved icon.',
  style: 'Styles forwarded to the resolved icon.',
  size: 'Width and height forwarded to the resolved icon.',
  stroke: 'Stroke width forwarded to the resolved icon.',
  color: 'Color forwarded to the resolved icon.',
  'aria-hidden': 'Hides a decorative icon from assistive technology.',
} satisfies Partial<Record<keyof ComponentProps<typeof Icon>, string>>;
