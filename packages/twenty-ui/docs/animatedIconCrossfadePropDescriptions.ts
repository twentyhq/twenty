import { type ComponentProps } from 'react';

import { type AnimatedIconCrossfade } from '../src/components/layout/AnimatedIconCrossfade/AnimatedIconCrossfade';

export const ANIMATED_ICON_CROSSFADE_PROP_DESCRIPTIONS = {
  isActive: 'Shows activeIcon when true and inactiveIcon otherwise.',
  activeIcon: 'Decorative node content for the active state.',
  inactiveIcon: 'Decorative node content for the inactive state.',
  className: 'CSS class applied to the inline span root.',
  style: 'Inline styles applied to the root, including width and height.',
  render: 'Replaces the span root while preserving both transition layers.',
} satisfies Partial<
  Record<keyof ComponentProps<typeof AnimatedIconCrossfade>, string>
>;
