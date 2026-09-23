import { type ListItemProps } from '@ui/primitives/navigation/ListItem/types/ListItemProps';

export type MenuItemSlotProps = Pick<
  ListItemProps,
  | 'color'
  | 'startIcon'
  | 'endIcon'
  | 'description'
  | 'descriptionPlacement'
  | 'hotkeys'
>;
