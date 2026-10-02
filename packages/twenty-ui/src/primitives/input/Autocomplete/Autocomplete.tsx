import { AutocompleteEmpty } from './internal/AutocompleteEmpty';
import { AutocompleteInput } from './internal/AutocompleteInput';
import { AutocompleteInputGroup } from './internal/AutocompleteInputGroup';
import { AutocompleteItem } from './internal/AutocompleteItem';
import { AutocompleteList } from './internal/AutocompleteList';
import { AutocompletePopup } from './internal/AutocompletePopup';
import { AutocompleteRoot } from './internal/AutocompleteRoot';

const createAutocomplete = () => ({
  Root: AutocompleteRoot,
  InputGroup: AutocompleteInputGroup,
  Input: AutocompleteInput,
  Popup: AutocompletePopup,
  List: AutocompleteList,
  Item: AutocompleteItem,
  Empty: AutocompleteEmpty,
});

export const Autocomplete = /* @__PURE__ */ createAutocomplete();
