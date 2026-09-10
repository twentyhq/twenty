import { type Input as InputPrimitive } from '@base-ui/react/input';

import { type InputSize } from '@ui/input/types/InputSize';

export type InputProps = Omit<InputPrimitive.Props, 'size'> & {
  size?: InputSize;
};
