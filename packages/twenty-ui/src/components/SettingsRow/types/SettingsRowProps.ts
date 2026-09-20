import { type ComponentPropsWithRef, type ReactNode } from 'react';

import { type SwitchProps } from '@ui/primitives/input/Switch/types/SwitchProps';
import { type ListItemProps } from '@ui/primitives/navigation/ListItem/types/ListItemProps';

export type SettingsRowProps = Omit<
  ComponentPropsWithRef<'label'>,
  'children' | 'htmlFor' | 'onChange' | 'onClick'
> &
  Pick<ListItemProps, 'startIcon' | 'description' | 'focused'> &
  Pick<
    SwitchProps,
    | 'checked'
    | 'defaultChecked'
    | 'onCheckedChange'
    | 'disabled'
    | 'readOnly'
    | 'size'
    | 'name'
    | 'value'
    | 'required'
  > & {
    children: ReactNode;
  };
