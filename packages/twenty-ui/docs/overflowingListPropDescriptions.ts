import { type ComponentProps } from 'react';

import { type OverflowingList } from '../src/components/layout/OverflowingList/OverflowingList';

export const OVERFLOWING_LIST_PROP_DESCRIPTIONS = {
  children: 'Complete ordered list of elements, each with a stable key.',
  showOverflowCount:
    'Shows the overflow count on hover and keyboard focus by default. Use true to show it whenever items overflow, or false to omit the trigger. An open popup stays open until it is dismissed.',
  maxInlineCount:
    'Maximum number of items mounted in the compact row. The popup still contains every item.',
  overflowLabel:
    'Accessible label for the popup. The overflow button is named by its visible count followed by this label. Defaults to Show all items.',
} satisfies Partial<
  Record<keyof ComponentProps<typeof OverflowingList>, string>
>;
