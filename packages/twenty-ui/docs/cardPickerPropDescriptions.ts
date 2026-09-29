import { type ComponentProps } from 'react';

import { type CardPicker } from '../src/components/input/CardPicker/CardPicker';

export const CARD_PICKER_PROP_DESCRIPTIONS = {
  children: 'Card content inside the radio control.',
} satisfies Partial<Record<keyof ComponentProps<typeof CardPicker>, string>>;
