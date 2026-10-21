import { type Autocomplete as AutocompletePrimitive } from '@base-ui/react/autocomplete';

export type AutocompletePopupProps = AutocompletePrimitive.Popup.Props & {
  width?: number | string;
};
