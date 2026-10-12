import { type Autocomplete as AutocompletePrimitive } from '@base-ui/react/autocomplete';

export type AutocompleteRootProps<TItem> = Omit<
  AutocompletePrimitive.Root.Props<TItem>,
  'items'
> & {
  items?: readonly TItem[];
};
