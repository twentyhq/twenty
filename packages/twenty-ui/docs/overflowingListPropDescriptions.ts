import { type ComponentProps } from 'react';

import { type OverflowingList } from '../src/components/layout/OverflowingList/OverflowingList';

export const OVERFLOWING_LIST_PROP_DESCRIPTIONS = {
  children:
    'Complete ordered list of elements, each with a stable key. The popup contains the complete list, including items visible in the compact row.',
  showOverflowCount:
    'Shows the count on hover, keyboard focus or while open by default. Use true to keep it visible whenever items overflow, or false to hide the count and clip the row. An already-open popup stays open until dismissed. Empty lists and lists that fit have no trigger.',
  maxInlineCount:
    'Maximum number of items visible in the compact row. Available width can reduce this count further. The popup still contains the complete list.',
  overflowLabel:
    'Accessible label for the popup. The default overflow button is named by its visible count followed by this label. Defaults to Show all items.',
  open: 'Controlled popup visibility. A popup can appear only when items overflow.',
  defaultOpen: 'Initial popup visibility when uncontrolled. Defaults to false.',
  actionsRef:
    'Ref exposing the Popover close() and unmount() methods. After preventUnmountOnClose(), call unmount() when the caller-owned exit finishes.',
  onOpenChange:
    'Receives the requested open state and unchanged Base UI event details, including reason, event, trigger, cancel() and preventUnmountOnClose().',
  triggerProps:
    'Popover.Trigger native props, handlers, ref, children and render composition for the count button. Click, mousedown, pointerdown, keydown and keyup stop propagation by default. Each supplied event handler replaces its default. Custom components must forward supplied props and ref.',
  popupProps:
    'Popover.Popup native props, handlers, ref, render composition and focus options for the overflow content. Click, mousedown, pointerdown, keydown and keyup stop propagation by default. Each supplied event handler replaces its default.',
  ref: 'Ref forwarded to the compact row root div.',
} satisfies Partial<
  Record<keyof ComponentProps<typeof OverflowingList>, string>
>;
