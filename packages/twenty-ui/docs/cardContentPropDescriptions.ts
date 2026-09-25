import { type ComponentProps } from 'react';

import { type Card } from '../src/primitives/surfaces/Card/Card';

export const CARD_CONTENT_PROP_DESCRIPTIONS = {
  children: 'Content displayed in the padded body.',
  className: 'CSS class applied to the body.',
  divider: 'Adds a bottom border.',
  isClickable:
    'Shows a pointer cursor. Does not add button semantics or keyboard interaction.',
  hasHoverHighlight: 'Changes the background on hover. Does not add an action.',
} satisfies Partial<Record<keyof ComponentProps<typeof Card.Content>, string>>;
