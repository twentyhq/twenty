import { type Menu as MenuPrimitive } from '@base-ui/react/menu';

import { type MenuItemSlotProps } from './MenuItemSlotProps';

export type MenuActionItemProps = MenuPrimitive.Item.Props & MenuItemSlotProps;
