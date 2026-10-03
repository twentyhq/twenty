import { type ComponentProps } from 'react';

import { type Card } from '../src/primitives/surfaces/Card/Card';

export const CARD_FOOTER_PROP_DESCRIPTIONS = {
  children: 'Footer content, such as actions or supporting text.',
  divider: 'Shows the top border unless explicitly set to false.',
} satisfies Partial<Record<keyof ComponentProps<typeof Card.Footer>, string>>;
