import { type Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';

import { type CheckboxColor } from './CheckboxColor';
import { type CheckboxShape } from './CheckboxShape';
import { type CheckboxSize } from './CheckboxSize';
import { type CheckboxVariant } from './CheckboxVariant';

export type CheckboxProps = Omit<CheckboxPrimitive.Root.Props, 'color'> & {
  size?: CheckboxSize;
  variant?: CheckboxVariant;
  shape?: CheckboxShape;
  color?: CheckboxColor;
  hoverable?: boolean;
};
