import { type Menu as MenuPrimitive } from '@base-ui/react/menu';

import { type MenuItemSlotProps } from './MenuItemSlotProps';

export type MenuSubmenuTriggerProps = MenuPrimitive.SubmenuTrigger.Props &
  MenuItemSlotProps;
