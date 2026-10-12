import { type Autocomplete as AutocompletePrimitive } from '@base-ui/react/autocomplete';

import { type ListItemProps } from '@ui/primitives/navigation/ListItem/types/ListItemProps';

export type AutocompleteItemProps = AutocompletePrimitive.Item.Props &
  Pick<
    ListItemProps,
    'startIcon' | 'endIcon' | 'description' | 'descriptionPlacement'
  >;
