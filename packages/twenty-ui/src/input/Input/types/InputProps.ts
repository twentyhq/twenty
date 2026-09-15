import { type Input as InputPrimitive } from '@base-ui/react/input';

import { type InputSize } from '@ui/input/types/InputSize';

export type InputProps = Omit<InputPrimitive.Props, 'size'> & {
  /** Visual size of the input. Inside an `InputGroup`, the group's size applies. */
  size?: InputSize;
};
