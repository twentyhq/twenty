import { type ListItemProps } from '@ui/primitives/ListItem/types/ListItemProps';

export type MenuItemSlotProps = Pick<
  ListItemProps,
  | 'color'
  | 'startIcon'
  | 'endIcon'
  | 'description'
  | 'descriptionPlacement'
  | 'hotkeys'
>;
