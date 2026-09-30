import { type ComponentProps } from 'react';

import { type InlineBanner } from '../src/components/feedback/InlineBanner/InlineBanner';

export const INLINE_BANNER_PROP_DESCRIPTIONS = {
  color: 'Banner palette color. An omitted color uses Banner’s default.',
  message:
    'Message text. Standard banners truncate with a focusable tooltip; compact banners wrap.',
  variant:
    'Standard full-width banner or compact wrapping message with a 512px maximum content width.',
  embedded:
    'Removes the bottom margin from standard banners. Compact banners have no bottom margin.',
  button:
    'Optional button or destination link with title, onClick, href, render, target, rel, download, hidden, disabled, aria-label, and Icon fields.',
  LeftIcon: 'Leading icon component. Defaults to the information icon.',
  className: 'Class applied to the banner.',
} satisfies Partial<Record<keyof ComponentProps<typeof InlineBanner>, string>>;
