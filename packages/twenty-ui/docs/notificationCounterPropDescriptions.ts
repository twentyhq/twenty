import { type ComponentProps } from 'react';

import { type NotificationCounter } from '../src/components/data-display/NotificationCounter/NotificationCounter';

export const NOTIFICATION_COUNTER_PROP_DESCRIPTIONS = {
  count: 'Number to display as supplied, without clamping or hiding zero.',
  variant: 'Primary or secondary badge styling.',
  className: 'Class applied to the badge.',
} satisfies Partial<
  Record<keyof ComponentProps<typeof NotificationCounter>, string>
>;
