import { type Input as InputPrimitive } from '@base-ui/react/input';
import { type useRender } from '@base-ui/react/use-render';

import { type InputSize } from '@ui/input/types/InputSize';

export type TextareaProps = Omit<
  useRender.ComponentProps<'textarea'>,
  'className'
> & {
  /**
   * CSS class applied to the textarea, or a function that returns a class
   * based on the input state.
   */
  className?: string | ((state: InputPrimitive.State) => string | undefined);
  /** Called with the new value when the textarea value changes. */
  onValueChange?: (
    value: string,
    eventDetails: InputPrimitive.ChangeEventDetails,
  ) => void;
  /** Visual size of the textarea. */
  size?: InputSize;
  /** Grows the textarea with its content instead of showing a scrollbar. */
  autoResize?: boolean;
  /**
   * Maximum number of rows the textarea grows to when `autoResize` is set.
   * Longer content scrolls.
   */
  maxRows?: number;
};
