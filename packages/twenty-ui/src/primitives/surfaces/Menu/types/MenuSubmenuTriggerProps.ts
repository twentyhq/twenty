import { type Menu as MenuPrimitive } from '@base-ui/react/menu';
import { type RefAttributes } from 'react';

import { type MenuItemSlotProps } from './MenuItemSlotProps';

export type MenuSubmenuTriggerProps = Omit<
  MenuPrimitive.SubmenuTrigger.Props,
  'ref'
> &
  RefAttributes<HTMLElement> &
  MenuItemSlotProps;
