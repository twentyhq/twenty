import { type Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';

import { type CheckboxColor } from './CheckboxColor';
import { type CheckboxShape } from './CheckboxShape';
import { type CheckboxSize } from './CheckboxSize';
import { type CheckboxVariant } from './CheckboxVariant';

export type CheckboxProps = Omit<CheckboxPrimitive.Root.Props, 'color'> & {
  /** Visual size of the checkbox. */
  size?: CheckboxSize;
  /** Visual style of the box: filled, outlined, or tinted. */
  variant?: CheckboxVariant;
  /** Corner shape of the box. */
  shape?: CheckboxShape;
  /** Color used while the checkbox is checked or indeterminate. */
  color?: CheckboxColor;
  /**
   * Adds padding around the box and a hover background. Disable it for a
   * compact checkbox inside another interactive element.
   */
  hoverable?: boolean;
};
