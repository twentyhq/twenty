import { type ComponentProps } from 'react';

import { type Radio } from '../src/primitives/input/Radio/Radio';

export const RADIO_PROP_DESCRIPTIONS = {
  children:
    'Option content. Card options wrap it in a padded full-width content area.',
  variant:
    'Appearance of the styled assembly: a standard radio or a full-width card. Both use the same span target unless render replaces it.',
} satisfies Partial<Record<keyof ComponentProps<typeof Radio>, string>>;
