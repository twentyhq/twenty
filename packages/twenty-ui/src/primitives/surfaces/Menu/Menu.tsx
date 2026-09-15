import { Menu as MenuPrimitive } from '@base-ui/react/menu';

import { MenuCheckboxItem } from './internal/MenuCheckboxItem';
import { MenuGroup } from './internal/MenuGroup';
import { MenuGroupLabel } from './internal/MenuGroupLabel';
import { MenuItem } from './internal/MenuItem';
import { MenuPopup } from './internal/MenuPopup';
import { MenuRadioGroup } from './internal/MenuRadioGroup';
import { MenuRadioItem } from './internal/MenuRadioItem';
import { MenuSeparator } from './internal/MenuSeparator';
import { MenuSubmenuRoot } from './internal/MenuSubmenuRoot';
import { MenuSubmenuTrigger } from './internal/MenuSubmenuTrigger';

export const Menu = {
  Root: MenuPrimitive.Root,
  Trigger: MenuPrimitive.Trigger,
  Popup: MenuPopup,
  Item: MenuItem,
  CheckboxItem: MenuCheckboxItem,
  RadioGroup: MenuRadioGroup,
  RadioItem: MenuRadioItem,
  Group: MenuGroup,
  GroupLabel: MenuGroupLabel,
  Separator: MenuSeparator,
  SubmenuRoot: MenuSubmenuRoot,
  SubmenuTrigger: MenuSubmenuTrigger,
};
