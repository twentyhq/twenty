import { type ComponentProps } from 'react';

import { type AnimatedIconCrossfade } from '../src/components/layout/AnimatedIconCrossfade/AnimatedIconCrossfade';

export const ANIMATED_ICON_CROSSFADE_PROP_DESCRIPTIONS = {
  isActive: 'Shows ActiveIcon when true and InactiveIcon otherwise.',
  ActiveIcon: 'Icon component for the active state.',
  InactiveIcon: 'Icon component for the inactive state.',
  size: 'Icon dimension in pixels. Defaults to the small theme icon size.',
} satisfies Partial<
  Record<keyof ComponentProps<typeof AnimatedIconCrossfade>, string>
>;
