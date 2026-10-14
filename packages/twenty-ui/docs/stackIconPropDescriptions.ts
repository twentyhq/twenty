import { type ComponentProps } from 'react';

import { type StackIcon } from '../src/components/data-display/StackIcon/StackIcon';

export const STACK_ICON_PROP_DESCRIPTIONS = {
  icon: 'Main icon content. The caller controls its dimensions and stroke.',
  stackedIcon:
    'Smaller content stacked on the bottom-right corner of the main icon, such as a 12px avatar.',
  className: 'CSS class applied to the container root.',
  style: 'Inline styles applied to the container root.',
  render:
    'Replaces the div root while preserving the icon content and native props.',
} satisfies Partial<Record<keyof ComponentProps<typeof StackIcon>, string>>;
