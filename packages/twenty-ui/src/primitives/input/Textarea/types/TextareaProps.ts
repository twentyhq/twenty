import { type Input as InputPrimitive } from '@base-ui/react/input';
import { type useRender } from '@base-ui/react/use-render';

import { type InputSize } from '@ui/primitives/input/types/InputSize';

export type TextareaProps = Omit<
  useRender.ComponentProps<
    'textarea',
    InputPrimitive.State,
    useRender.ElementProps<'textarea'>
  >,
  'className'
> & {
  /**
   * CSS class applied to the textarea, or a function that returns a class
   * based on the input state.
   */
  className?: string | ((state: InputPrimitive.State) => string | undefined);
  onValueChange?: (
    value: string,
    eventDetails: InputPrimitive.ChangeEventDetails,
  ) => void;
  /** Visual size of the textarea. */
  size?: InputSize;
  autoResize?: boolean;
  maxRows?: number;
};
