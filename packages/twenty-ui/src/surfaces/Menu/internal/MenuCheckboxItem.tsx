import { Menu as MenuPrimitive } from '@base-ui/react/menu';

import { type MenuCheckboxItemProps } from '../types/MenuCheckboxItemProps';

import { getMenuListItemProps } from './getMenuListItemProps';

export const MenuCheckboxItem = (props: MenuCheckboxItemProps) => (
  <MenuPrimitive.CheckboxItem
    {...getMenuListItemProps<
      MenuPrimitive.CheckboxItem.State,
      MenuCheckboxItemProps
    >(props, (state) => ({ indicator: 'checkbox', selected: state.checked }))}
  />
);
