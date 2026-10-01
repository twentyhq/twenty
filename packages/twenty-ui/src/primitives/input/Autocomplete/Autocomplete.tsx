import { Autocomplete as AutocompletePrimitive } from '@base-ui/react/autocomplete';

import { AutocompleteEmpty } from './internal/AutocompleteEmpty';
import { AutocompleteInput } from './internal/AutocompleteInput';
import { AutocompleteInputGroup } from './internal/AutocompleteInputGroup';
import { AutocompleteItem } from './internal/AutocompleteItem';
import { AutocompleteList } from './internal/AutocompleteList';
import { AutocompletePopup } from './internal/AutocompletePopup';

export const Autocomplete = {
  Root: AutocompletePrimitive.Root,
  InputGroup: AutocompleteInputGroup,
  Input: AutocompleteInput,
  Popup: AutocompletePopup,
  List: AutocompleteList,
  Item: AutocompleteItem,
  Empty: AutocompleteEmpty,
};
