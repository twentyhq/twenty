import { type ComponentProps } from 'react';

import { type IllustrationIconWrapper } from '../src/icon/components/IllustrationIconWrapper';

export const ILLUSTRATION_ICON_WRAPPER_PROP_DESCRIPTIONS = {
  children: 'Illustration content to center inside the wrapper.',
  className: 'Class merged with the illustration wrapper styling.',
} satisfies Partial<
  Record<keyof ComponentProps<typeof IllustrationIconWrapper>, string>
>;
