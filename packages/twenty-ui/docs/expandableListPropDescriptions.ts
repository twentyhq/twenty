import { type ComponentProps } from 'react';

import { type ExpandableList } from '../src/components/layout/ExpandableList/ExpandableList';

export const EXPANDABLE_LIST_PROP_DESCRIPTIONS = {
  children: 'Complete ordered list of elements, each with a stable key.',
  showOverflowCount:
    'Shows the overflow count on hover and keyboard focus by default. Use true to show it whenever items overflow, or false to omit the trigger.',
  maxInlineCount:
    'Maximum number of items mounted in the compact row. The popup still contains every item.',
  overflowLabel:
    'Accessible label for the overflow button and popup. Defaults to Show all items.',
} satisfies Partial<
  Record<keyof ComponentProps<typeof ExpandableList>, string>
>;
