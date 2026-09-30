import { type ComponentProps } from 'react';

import { type MenuItem } from '../src/components/navigation/MenuItem/MenuItem';

export const MENU_ITEM_PROP_DESCRIPTIONS = {
  accent: 'Default, danger, or placeholder row styling.',
  className: 'Class applied to the row.',
  withIconContainer: 'Places leading content in an icon container.',
  withIconContainerBackground:
    'Adds a background to the leading icon container.',
  iconButtons: 'Trailing action elements.',
  isIconDisplayedOnHoverOnly: 'Reveals trailing action elements only on hover.',
  isTooltipOpen: 'Accepted for compatibility; currently has no effect.',
  LeftIcon: 'Leading icon component.',
  iconThemeColor: 'Theme color for the leading icon.',
  LeftComponent: 'Custom leading content.',
  RightIcon: 'Trailing icon component.',
  RightComponent: 'Custom trailing content.',
  onClick:
    'Pointer activation callback. The row itself does not add keyboard or menu semantics.',
  onMouseEnter: 'Pointer-entry callback on the row.',
  onMouseLeave: 'Pointer-exit callback on the row.',
  testId: 'Value of the row’s data-testid attribute.',
  disabled: 'Disables activation and applies disabled styling.',
  text: 'Main row label.',
  contextualTextPosition: 'Position of the supporting text.',
  contextualText: 'Supporting text beside the main label.',
  hasSubMenu: 'Shows a submenu chevron; does not create a submenu.',
  focused: 'Applies focused appearance without moving DOM focus.',
  selected: 'Applies selected appearance without owning selection state.',
  shortcut:
    'Explicit shortcut combination or sequence. Register handlers in the application.',
  shortcutJoinLabel:
    'Text between sequential shortcut steps. Defaults to `then`.',
  isSubMenuOpened: 'Applies the open treatment to the submenu chevron.',
} satisfies Partial<Record<keyof ComponentProps<typeof MenuItem>, string>>;
