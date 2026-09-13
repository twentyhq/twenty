import { type Select as SelectPrimitive } from '@base-ui/react/select';

import { type InputSize } from '@ui/input/types/InputSize';

export type SelectTriggerProps = SelectPrimitive.Trigger.Props & {
  size?: InputSize;
};
