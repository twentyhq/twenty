import { type ComponentProps } from 'react';

import { type Card } from '../src/primitives/surfaces/Card/Card';

export const CARD_PROP_DESCRIPTIONS = {
  children: 'Card sections or other content.',
  fullWidth: 'Sets the card width to 100% of its container.',
  rounded:
    'Compatibility styling flag. Cards already use the same rounded corners when omitted.',
  backgroundColor:
    'CSS background color of the outer card. Child sections have their own backgrounds.',
} satisfies Partial<Record<keyof ComponentProps<typeof Card.Root>, string>>;
