import { type ComponentProps } from 'react';

import { type Radio } from '../src/primitives/input/Radio/Radio';

export const RADIO_PROP_DESCRIPTIONS = {
  children:
    'Option content. Card options wrap it in a padded full-width content area.',
  variant:
    'Presentation of the option: a standard radio or a full-width card. Defaults to default.',
} satisfies Partial<Record<keyof ComponentProps<typeof Radio>, string>>;
