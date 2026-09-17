import { Menu as MenuPrimitive } from '@base-ui/react/menu';

import { type MenuRadioItemProps } from '../types/MenuRadioItemProps';

import { getMenuListItemProps } from './getMenuListItemProps';

export const MenuRadioItem = (props: MenuRadioItemProps) => (
  <MenuPrimitive.RadioItem
    {...getMenuListItemProps<MenuPrimitive.RadioItem.State, MenuRadioItemProps>(
      props,
      (state) => ({ indicator: 'check', selected: state.checked }),
    )}
  />
);
