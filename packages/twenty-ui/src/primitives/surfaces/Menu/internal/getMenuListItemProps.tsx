import { type ComponentRenderFn, type HTMLProps } from '@base-ui/react/types';
import { isFunction } from '@sniptt/guards';
import { type ReactElement, type ReactNode } from 'react';

import { ListItem } from '@ui/primitives/navigation/ListItem/ListItem';
import { type ListItemProps } from '@ui/primitives/navigation/ListItem/types/ListItemProps';

import { type MenuItemSlotProps } from '../types/MenuItemSlotProps';

type MenuListItemProps<TState> = MenuItemSlotProps & {
  children?: ReactNode;
  disabled?: boolean;
  render?: ReactElement | ComponentRenderFn<HTMLProps, TState>;
};

export const getMenuListItemProps = <
  TState,
  TProps extends MenuListItemProps<TState>,
>({
  props: {
    color = 'neutral',
    startIcon,
    endIcon,
    description,
    descriptionPlacement,
    shortcut,
    shortcutJoinLabel,
    disabled = false,
    children,
    render,
    ...props
  },
  getListItemState,
}: {
  props: TProps;
  getListItemState?: (
    state: TState,
  ) => Pick<ListItemProps, 'indicator' | 'selected' | 'hasSubmenu'>;
}) => ({
  ...props,
  disabled,
  render: (renderProps: HTMLProps, state: TState) => (
    <ListItem
      {...renderProps}
      render={
        isFunction(render)
          ? (listItemProps) => render(listItemProps, state)
          : render
      }
      color={color}
      disabled={disabled}
      startIcon={startIcon}
      endIcon={endIcon}
      description={description}
      descriptionPlacement={descriptionPlacement}
      shortcut={shortcut}
      shortcutJoinLabel={shortcutJoinLabel}
      {...getListItemState?.(state)}
    >
      {children}
    </ListItem>
  ),
});
