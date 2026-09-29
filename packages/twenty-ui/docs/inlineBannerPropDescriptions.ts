import { type ComponentProps } from 'react';

import { type InlineBanner } from '../src/components/feedback/InlineBanner/InlineBanner';

export const INLINE_BANNER_PROP_DESCRIPTIONS = {
  color: 'Banner palette color. An omitted color uses Banner’s default.',
  message: 'Message, truncated with its full text available in a tooltip.',
  embedded: 'Uses the embedded banner appearance.',
  button:
    'Optional action with title, onClick, hidden, disabled, and Icon fields.',
  LeftIcon: 'Leading icon component. Defaults to the information icon.',
  className: 'Class applied to the banner.',
} satisfies Partial<Record<keyof ComponentProps<typeof InlineBanner>, string>>;
