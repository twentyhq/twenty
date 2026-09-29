import { type ComponentProps } from 'react';

import { type Info } from '../src/components/feedback/Info/Info';

export const INFO_PROP_DESCRIPTIONS = {
  accent: 'Information or danger styling.',
  text: 'Message displayed beside the information icon.',
  buttonTitle:
    'Visible label for the optional action. Requires href or onClick.',
  onClick: 'Action callback when href is absent.',
  href: 'Action destination. Takes precedence over onClick.',
  render:
    'Custom render element for the link action, forwarded to Button when href is supplied.',
} satisfies Partial<Record<keyof ComponentProps<typeof Info>, string>>;
