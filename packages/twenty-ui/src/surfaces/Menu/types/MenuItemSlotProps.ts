import { type ListItemProps } from '@ui/navigation/ListItem/types/ListItemProps';

export type MenuItemSlotProps = Pick<
  ListItemProps,
  | 'color'
  | 'startIcon'
  | 'endIcon'
  | 'description'
  | 'descriptionPlacement'
  | 'hotkeys'
>;
