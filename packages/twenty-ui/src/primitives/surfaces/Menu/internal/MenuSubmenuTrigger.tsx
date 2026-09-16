import { Menu as MenuPrimitive } from '@base-ui/react/menu';

import { type MenuSubmenuTriggerProps } from '../types/MenuSubmenuTriggerProps';

import { getMenuListItemProps } from './getMenuListItemProps';

export const MenuSubmenuTrigger = (props: MenuSubmenuTriggerProps) => (
  <MenuPrimitive.SubmenuTrigger
    {...getMenuListItemProps<
      MenuPrimitive.SubmenuTrigger.State,
      MenuSubmenuTriggerProps
    >(props, () => ({ hasSubmenu: true }))}
  />
);
