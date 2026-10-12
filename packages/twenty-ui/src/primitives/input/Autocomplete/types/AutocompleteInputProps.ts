import { type Autocomplete as AutocompletePrimitive } from '@base-ui/react/autocomplete';

import { type InputSize } from '@ui/primitives/input/types/InputSize';

export type AutocompleteInputProps = Omit<
  AutocompletePrimitive.Input.Props,
  'size'
> & {
  size?: InputSize;
};
