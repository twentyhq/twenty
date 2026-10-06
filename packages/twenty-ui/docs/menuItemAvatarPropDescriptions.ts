import { type ComponentProps } from 'react';

import { type MenuItemAvatar } from '../src/components/navigation/MenuItemAvatar/MenuItemAvatar';

export const MENU_ITEM_AVATAR_PROP_DESCRIPTIONS = {
  accent: 'Default, danger, or placeholder row styling.',
  className: 'Class applied to the row.',
  iconButtons: 'Trailing action elements.',
  isIconDisplayedOnHoverOnly: 'Reveals trailing action elements only on hover.',
  avatar:
    'Avatar name, source, color seed, size, and shape. Omit to hide the avatar.',
  onClick:
    'Pointer activation callback. The row itself does not add keyboard or menu semantics.',
  onMouseEnter: 'Pointer-entry callback on the row.',
  onMouseLeave: 'Pointer-exit callback on the row.',
  testId: 'Value of the row’s data-testid attribute.',
  text: 'Main row label.',
  hasSubMenu: 'Shows a submenu chevron; does not create a submenu.',
  contextualText: 'Supporting text beside the main label.',
} satisfies Partial<
  Record<keyof ComponentProps<typeof MenuItemAvatar>, string>
>;
