import { type ComponentProps } from 'react';

import { type RoundedLink } from '../src/components/navigation/RoundedLink/RoundedLink';

export const ROUNDED_LINK_PROP_DESCRIPTIONS = {
  href: 'Destination URL, normalized by the safe-URL helper. Opens in a new tab.',
  label: 'Visible link text. An absent or empty label renders nothing.',
  color: 'Label text color: primary or secondary.',
  onClick: 'Click callback after propagation is stopped.',
  className: 'Class applied to the link.',
} satisfies Partial<Record<keyof ComponentProps<typeof RoundedLink>, string>>;
