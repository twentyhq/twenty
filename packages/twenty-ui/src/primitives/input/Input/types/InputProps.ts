import { type Input as InputPrimitive } from '@base-ui/react/input';

import { type InputSize } from '@ui/primitives/input/types/InputSize';
import { type InputVariant } from '@ui/primitives/input/types/InputVariant';

export type InputProps = Omit<InputPrimitive.Props, 'size'> & {
  size?: InputSize;
  variant?: InputVariant;
  hasFocusRing?: boolean;
  textAlign?: 'start' | 'end';
};
