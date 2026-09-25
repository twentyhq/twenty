import { type ComponentProps } from 'react';

import { type VisibilityHidden } from '../src/primitives/accessibility/components/VisibilityHidden';

export const VISIBILITY_HIDDEN_PROP_DESCRIPTIONS = {
  children:
    'Content hidden visually while remaining available to assistive technology.',
} satisfies Partial<
  Record<keyof ComponentProps<typeof VisibilityHidden>, string>
>;
