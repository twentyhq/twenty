import { Menu as MenuPrimitive } from '@base-ui/react/menu';

import { type MenuSubmenuRootProps } from '../types/MenuSubmenuRootProps';
import { MenuNestingContext } from './MenuNestingContext';

export const MenuSubmenuRoot = ({
  children,
  ...props
}: MenuSubmenuRootProps) => (
  <MenuNestingContext.Provider value={true}>
    <MenuPrimitive.SubmenuRoot {...props}>{children}</MenuPrimitive.SubmenuRoot>
  </MenuNestingContext.Provider>
);
