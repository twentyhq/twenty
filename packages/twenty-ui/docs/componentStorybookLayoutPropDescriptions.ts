import { type ComponentProps } from 'react';

import { type ComponentStorybookLayout } from '../src/testing/ComponentStorybookLayout';

export const COMPONENT_STORYBOOK_LAYOUT_PROP_DESCRIPTIONS = {
  children: 'The component preview element.',
  width:
    'Container width in pixels. When omitted, the container has a 300px minimum width.',
  height: 'Container height in pixels. Defaults to fit-content.',
  backgroundColor: 'Background color override.',
} satisfies Partial<
  Record<keyof ComponentProps<typeof ComponentStorybookLayout>, string>
>;
