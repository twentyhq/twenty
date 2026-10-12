import { Menu as MenuPrimitive } from '@base-ui/react/menu';

import { type MenuItemProps } from '../types/MenuItemProps';

import { getMenuListItemProps } from './getMenuListItemProps';

export const MenuItem = (props: MenuItemProps) => (
  <MenuPrimitive.Item
    {...getMenuListItemProps<MenuPrimitive.Item.State, MenuItemProps>({
      props,
    })}
  />
);
