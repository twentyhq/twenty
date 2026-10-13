import { type ComponentProps } from 'react';

import { type MenuItemDraggable } from '../src/components/navigation/MenuItemDraggable/MenuItemDraggable';

export const MENU_ITEM_DRAGGABLE_PROP_DESCRIPTIONS = {
  LeftIcon: 'Leading icon component.',
  LeftComponent: 'Custom leading content.',
  withIconContainer: 'Places leading content in an icon container.',
  accent: 'Default, danger, or placeholder row styling.',
  iconButtons: 'Trailing action elements.',
  isTooltipOpen: 'Accepted for compatibility; currently has no effect.',
  onClick:
    'Pointer activation callback. The row itself does not add keyboard or menu semantics.',
  text: 'Main row label.',
  contextualText: 'Supporting text beside the main label.',
  className: 'Class applied to the row.',
  isIconDisplayedOnHoverOnly: 'Reveals trailing action elements only on hover.',
  gripMode:
    'Grip visibility: never, always, or onHover. always and onHover render a single leading content (LeftComponent when set, otherwise LeftIcon); onHover swaps it for the grip on hover and shows no grip without leading content. Does not implement dragging.',
  isDragDisabled:
    'Disables drag appearance without installing or removing drag handlers.',
  isHoverDisabled: 'Accepted for compatibility; currently has no effect.',
} satisfies Partial<
  Record<keyof ComponentProps<typeof MenuItemDraggable>, string>
>;
