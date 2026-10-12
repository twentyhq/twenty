import { type NumberFieldInputProps } from '@ui/primitives/input/NumberField/types/NumberFieldInputProps';
import { type NumberFieldRootProps } from '@ui/primitives/input/NumberField/types/NumberFieldRootProps';

export type NumberStepperProps = Omit<
  NumberFieldInputProps,
  | 'children'
  | 'defaultValue'
  | 'disabled'
  | 'max'
  | 'min'
  | 'name'
  | 'onChange'
  | 'readOnly'
  | 'required'
  | 'size'
  | 'step'
  | 'type'
  | 'value'
> &
  Pick<
    NumberFieldRootProps,
    | 'allowOutOfRange'
    | 'defaultValue'
    | 'disabled'
    | 'max'
    | 'min'
    | 'name'
    | 'onValueChange'
    | 'onValueCommitted'
    | 'readOnly'
    | 'required'
    | 'value'
  > & {
    step?: number;
    showButtons?: boolean;
    decrementLabel?: string;
    incrementLabel?: string;
  };
