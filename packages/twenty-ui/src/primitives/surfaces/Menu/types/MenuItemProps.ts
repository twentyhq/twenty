import { type Menu as MenuPrimitive } from '@base-ui/react/menu';
import { type RefAttributes } from 'react';

import { type MenuItemSlotProps } from './MenuItemSlotProps';

export type MenuItemProps = Omit<MenuPrimitive.Item.Props, 'ref'> &
  RefAttributes<HTMLElement> &
  MenuItemSlotProps;
