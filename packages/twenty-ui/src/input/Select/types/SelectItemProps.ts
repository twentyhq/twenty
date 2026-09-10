import { type Select as SelectPrimitive } from '@base-ui/react/select';

import { type ListItemProps } from '@ui/navigation/ListItem/types/ListItemProps';

export type SelectItemProps = SelectPrimitive.Item.Props &
  Pick<
    ListItemProps,
    'startIcon' | 'endIcon' | 'description' | 'descriptionPlacement'
  >;
