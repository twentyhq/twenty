import { Select as SelectPrimitive } from '@base-ui/react/select';

import { SelectGroupLabel } from './internal/SelectGroupLabel';
import { SelectItem } from './internal/SelectItem';
import { SelectPopup } from './internal/SelectPopup';
import { SelectSeparator } from './internal/SelectSeparator';
import { SelectTrigger } from './internal/SelectTrigger';
import { SelectValue } from './internal/SelectValue';

export const Select = {
  Root: SelectPrimitive.Root,
  Trigger: SelectTrigger,
  Value: SelectValue,
  Popup: SelectPopup,
  Item: SelectItem,
  Group: SelectPrimitive.Group,
  GroupLabel: SelectGroupLabel,
  Separator: SelectSeparator,
};
