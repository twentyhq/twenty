import { Select as SelectPrimitive } from '@base-ui/react/select';

import { SelectGroupLabel } from './internal/SelectGroupLabel';
import { SelectIcon } from './internal/SelectIcon';
import { SelectItem } from './internal/SelectItem';
import { SelectItemIndicator } from './internal/SelectItemIndicator';
import { SelectItemText } from './internal/SelectItemText';
import { SelectPopup } from './internal/SelectPopup';
import { SelectPortal } from './internal/SelectPortal';
import { SelectPositioner } from './internal/SelectPositioner';
import { SelectSeparator } from './internal/SelectSeparator';
import { SelectTrigger } from './internal/SelectTrigger';
import { SelectValue } from './internal/SelectValue';

const createSelect = () => ({
  Root: SelectPrimitive.Root,
  Label: SelectPrimitive.Label,
  Trigger: SelectTrigger,
  Value: SelectValue,
  Icon: SelectIcon,
  Portal: SelectPortal,
  Backdrop: SelectPrimitive.Backdrop,
  Positioner: SelectPositioner,
  Popup: SelectPopup,
  List: SelectPrimitive.List,
  Item: SelectItem,
  ItemIndicator: SelectItemIndicator,
  ItemText: SelectItemText,
  Arrow: SelectPrimitive.Arrow,
  ScrollDownArrow: SelectPrimitive.ScrollDownArrow,
  ScrollUpArrow: SelectPrimitive.ScrollUpArrow,
  Group: SelectPrimitive.Group,
  GroupLabel: SelectGroupLabel,
  Separator: SelectSeparator,
});

// Base UI namespace reads would otherwise retain Select in unrelated imports.
export const Select = /* @__PURE__ */ createSelect();
