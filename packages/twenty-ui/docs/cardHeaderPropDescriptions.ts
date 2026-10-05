import { type ComponentProps } from 'react';

import { type Card } from '../src/primitives/surfaces/Card/Card';

export const CARD_HEADER_PROP_DESCRIPTIONS = {
  children:
    'Header content. Supply a Heading when the title should be a semantic heading.',
  className: 'CSS class applied to the header.',
} satisfies Partial<Record<keyof ComponentProps<typeof Card.Header>, string>>;
