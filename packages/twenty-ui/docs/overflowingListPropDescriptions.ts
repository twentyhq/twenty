import { type ComponentProps } from 'react';

import { type OverflowingList } from '../src/components/layout/OverflowingList/OverflowingList';

export const OVERFLOWING_LIST_PROP_DESCRIPTIONS = {
  children:
    'Complete ordered list of elements, each with a stable key. The popup contains only items that do not fit in the compact row.',
  showOverflowCount:
    'Shows the count on hover, keyboard focus or while open by default. Use true to keep it visible whenever items overflow, or false to clip the row without a trigger or exposed popup. Empty lists and lists that fit have no trigger.',
  maxInlineCount:
    'Maximum number of items visible in the compact row. Available width can reduce this count further. Remaining items belong to the popup.',
  overflowLabel:
    'Accessible label for the popup. The default overflow button is named by its visible count followed by this label. Defaults to Show hidden items.',
  open: 'Controlled popup visibility. A popup can appear only when items overflow and showOverflowCount is not false.',
  defaultOpen: 'Initial popup visibility when uncontrolled. Defaults to false.',
  onOpenChange:
    'Receives the requested open state and unchanged Base UI event details, including reason, event, trigger, cancel() and preventUnmountOnClose().',
  triggerProps:
    'Popover.Trigger native props, handlers, ref, children and render composition for the count button. Custom components must forward supplied props and ref.',
  popupProps:
    'Popover.Popup native props, handlers, ref, render composition and focus options for the overflow content.',
  ref: 'Ref forwarded to the compact row root div.',
} satisfies Partial<
  Record<keyof ComponentProps<typeof OverflowingList>, string>
>;
