import { Menu as MenuPrimitive } from '@base-ui/react/menu';

import { type MenuActionItemProps } from '../types/MenuActionItemProps';

import { getMenuListItemProps } from './getMenuListItemProps';

export const MenuItem = (props: MenuActionItemProps) => (
  <MenuPrimitive.Item
    {...getMenuListItemProps<MenuPrimitive.Item.State, MenuActionItemProps>(
      props,
    )}
  />
);
