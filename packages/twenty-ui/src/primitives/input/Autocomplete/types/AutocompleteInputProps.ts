import { type Autocomplete as AutocompletePrimitive } from '@base-ui/react/autocomplete';

import { type InputSize } from '@ui/primitives/input/types/InputSize';

type AutocompletePrimitiveInputProps = Omit<
  AutocompletePrimitive.Input.Props,
  'size'
>;

type AutocompleteInputAppearanceProps =
  | {
      render?: undefined;
      size?: InputSize;
    }
  | {
      render: NonNullable<AutocompletePrimitive.Input.Props['render']>;
      size?: never;
    };

export type AutocompleteInputProps = AutocompletePrimitiveInputProps &
  AutocompleteInputAppearanceProps;
