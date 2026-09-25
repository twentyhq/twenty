import { type ComponentProps } from 'react';

import { type Banner } from '../src/primitives/feedback/Banner/Banner';

export const BANNER_PROP_DESCRIPTIONS = {
  children: 'Message and optional actions displayed inside the banner.',
  color: 'Blue information treatment or danger treatment.',
  variant: 'Primary solid treatment or secondary translucent treatment.',
  className: 'CSS class applied to the banner.',
} satisfies Partial<Record<keyof ComponentProps<typeof Banner>, string>>;
