import { type Button as ButtonPrimitive } from '@base-ui/react/button';
import { type ComponentPropsWithRef } from 'react';

import { type ListItemProps } from '@ui/primitives/navigation/ListItem/types/ListItemProps';

export type ListItemButtonProps = Omit<
  ComponentPropsWithRef<'button'>,
  'color'
> &
  Pick<ButtonPrimitive.Props, 'focusableWhenDisabled'> &
  Pick<
    ListItemProps,
    | 'color'
    | 'selected'
    | 'focused'
    | 'indicator'
    | 'startIcon'
    | 'endIcon'
    | 'description'
    | 'descriptionPlacement'
    | 'shortcut'
    | 'shortcutJoinLabel'
    | 'hasSubmenu'
  >;
