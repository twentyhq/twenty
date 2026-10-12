import { type VisuallyHiddenProps } from '../src/primitives/accessibility/types/VisuallyHiddenProps';

export const VISUALLY_HIDDEN_PROP_DESCRIPTIONS = {
  children:
    'Content hidden visually while remaining available to assistive technology.',
  render:
    'Element or render function composed with the hidden span props and ref.',
} satisfies Partial<Record<keyof VisuallyHiddenProps, string>>;
