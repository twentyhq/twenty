import { type Menu as MenuPrimitive } from '@base-ui/react/menu';
import { type RefAttributes } from 'react';

import { type MenuItemSlotProps } from './MenuItemSlotProps';

export type MenuCheckboxItemProps = Omit<
  MenuPrimitive.CheckboxItem.Props,
  'ref'
> &
  RefAttributes<HTMLElement> &
  MenuItemSlotProps;
