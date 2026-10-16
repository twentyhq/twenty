import { type DropdownOptionItemProps } from '../types/DropdownOptionItemProps';
import { type DropdownType } from '../types/DropdownType';

export const getDropdownOptionItemRole = ({
  type,
  hasSelectionState,
  hasSelectionOwner,
  multiple,
  role,
}: {
  type: DropdownType;
  hasSelectionState: boolean;
  hasSelectionOwner: boolean;
  multiple: boolean;
  role: DropdownOptionItemProps['role'];
}): DropdownOptionItemProps['role'] => {
  if (type === 'menu' && hasSelectionState) {
    return multiple ? 'menuitemcheckbox' : 'menuitemradio';
  }

  if (type === 'menu') {
    return 'menuitem';
  }

  if (type === 'picker' && hasSelectionOwner) {
    return 'option';
  }

  return role;
};
