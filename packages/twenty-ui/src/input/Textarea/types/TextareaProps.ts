import { type Input as InputPrimitive } from '@base-ui/react/input';
import { type useRender } from '@base-ui/react/use-render';

import { type InputSize } from '@ui/input/types/InputSize';

export type TextareaProps = Omit<
  useRender.ComponentProps<'textarea'>,
  'className'
> & {
  className?: string | ((state: InputPrimitive.State) => string | undefined);
  onValueChange?: (
    value: string,
    eventDetails: InputPrimitive.ChangeEventDetails,
  ) => void;
  size?: InputSize;
  autoResize?: boolean;
  maxRows?: number;
};
