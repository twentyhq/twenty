import { type Button as ButtonPrimitive } from '@base-ui/react/button';
import { type ReactElement } from 'react';

import { type ListItemProps } from '@ui/primitives/navigation/ListItem/types/ListItemProps';

export type DropdownActionItemProps = Omit<
  ButtonPrimitive.Props,
  'render' | 'className' | 'style'
> &
  Pick<
    ListItemProps,
    | 'color'
    | 'startIcon'
    | 'endIcon'
    | 'description'
    | 'descriptionPlacement'
    | 'hotkeys'
    | 'hasSubmenu'
  > & {
    render?: ReactElement;
    className?: string;
    style?: React.CSSProperties;
    closeOnClick?: boolean;
    page?: string;
  };
