import { type ComponentProps } from 'react';

import { type Radio } from '../src/primitives/input/Radio/Radio';

export const RADIO_PROP_DESCRIPTIONS = {
  children:
    'Option content. Card options wrap it in a padded full-width content area.',
  variant:
    'Appearance of the styled assembly: a standard radio or a full-width card. Standard radios use a span and card radios use a div unless render replaces the root.',
} satisfies Partial<Record<keyof ComponentProps<typeof Radio>, string>>;
