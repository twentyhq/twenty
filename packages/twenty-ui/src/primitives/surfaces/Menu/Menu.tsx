import { Menu as MenuPrimitive } from '@base-ui/react/menu';

import { MenuCheckboxItem } from './internal/MenuCheckboxItem';
import { MenuGroup } from './internal/MenuGroup';
import { MenuGroupLabel } from './internal/MenuGroupLabel';
import { MenuItem } from './internal/MenuItem';
import { MenuPopup } from './internal/MenuPopup';
import { MenuPortal } from './internal/MenuPortal';
import { MenuPositioner } from './internal/MenuPositioner';
import { MenuRadioGroup } from './internal/MenuRadioGroup';
import { MenuRadioItem } from './internal/MenuRadioItem';
import { MenuSeparator } from './internal/MenuSeparator';
import { MenuSubmenuRoot } from './internal/MenuSubmenuRoot';
import { MenuSubmenuTrigger } from './internal/MenuSubmenuTrigger';

export const Menu = {
  Root: MenuPrimitive.Root,
  Trigger: MenuPrimitive.Trigger,
  Portal: MenuPortal,
  Positioner: MenuPositioner,
  Popup: MenuPopup,
  Arrow: MenuPrimitive.Arrow,
  Backdrop: MenuPrimitive.Backdrop,
  Viewport: MenuPrimitive.Viewport,
  Item: MenuItem,
  LinkItem: MenuPrimitive.LinkItem,
  CheckboxItem: MenuCheckboxItem,
  CheckboxItemIndicator: MenuPrimitive.CheckboxItemIndicator,
  RadioGroup: MenuRadioGroup,
  RadioItem: MenuRadioItem,
  RadioItemIndicator: MenuPrimitive.RadioItemIndicator,
  Group: MenuGroup,
  GroupLabel: MenuGroupLabel,
  Separator: MenuSeparator,
  SubmenuRoot: MenuSubmenuRoot,
  SubmenuTrigger: MenuSubmenuTrigger,
  Handle: MenuPrimitive.Handle,
  createHandle: MenuPrimitive.createHandle,
};
