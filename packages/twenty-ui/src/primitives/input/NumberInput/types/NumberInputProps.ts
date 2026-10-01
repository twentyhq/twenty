import { type NumberField } from '@base-ui/react/number-field';

export type NumberInputProps = Omit<
  NumberField.Input.Props,
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
    NumberField.Root.Props,
    | 'defaultValue'
    | 'disabled'
    | 'max'
    | 'min'
    | 'name'
    | 'onValueChange'
    | 'readOnly'
    | 'required'
    | 'value'
  > & {
    step?: number;
    showButtons?: boolean;
    decrementLabel?: string;
    incrementLabel?: string;
  };
