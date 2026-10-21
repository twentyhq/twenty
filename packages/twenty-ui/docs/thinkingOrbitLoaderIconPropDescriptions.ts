import { type ComponentProps } from 'react';

import { type ThinkingOrbitLoaderIcon } from '../src/icon/components/ThinkingOrbitLoaderIcon';

export const THINKING_ORBIT_LOADER_ICON_PROP_DESCRIPTIONS = {
  size: 'Width and height in pixels.',
  className:
    'Class applied to the SVG. The icon is always hidden from assistive technology.',
} satisfies Partial<
  Record<keyof ComponentProps<typeof ThinkingOrbitLoaderIcon>, string>
>;
