import { Autocomplete as AutocompletePrimitive } from '@base-ui/react/autocomplete';

import { AutocompleteArrow } from './internal/AutocompleteArrow';
import { AutocompleteEmpty } from './internal/AutocompleteEmpty';
import { AutocompleteInput } from './internal/AutocompleteInput';
import { AutocompleteInputGroup } from './internal/AutocompleteInputGroup';
import { AutocompleteItem } from './internal/AutocompleteItem';
import { AutocompleteList } from './internal/AutocompleteList';
import { AutocompletePopup } from './internal/AutocompletePopup';
import { AutocompletePortal } from './internal/AutocompletePortal';
import { AutocompletePositioner } from './internal/AutocompletePositioner';
import { AutocompleteSeparator } from './internal/AutocompleteSeparator';

const createAutocomplete = () => ({
  Root: AutocompletePrimitive.Root,
  Value: AutocompletePrimitive.Value,
  Trigger: AutocompletePrimitive.Trigger,
  InputGroup: AutocompleteInputGroup,
  Input: AutocompleteInput,
  Icon: AutocompletePrimitive.Icon,
  Clear: AutocompletePrimitive.Clear,
  Portal: AutocompletePortal,
  Backdrop: AutocompletePrimitive.Backdrop,
  Positioner: AutocompletePositioner,
  Popup: AutocompletePopup,
  Arrow: AutocompleteArrow,
  List: AutocompleteList,
  Status: AutocompletePrimitive.Status,
  Group: AutocompletePrimitive.Group,
  GroupLabel: AutocompletePrimitive.GroupLabel,
  Item: AutocompleteItem,
  Row: AutocompletePrimitive.Row,
  Collection: AutocompletePrimitive.Collection,
  Empty: AutocompleteEmpty,
  Separator: AutocompleteSeparator,
  useFilter: AutocompletePrimitive.useFilter,
  useFilteredItems: AutocompletePrimitive.useFilteredItems,
});

export const Autocomplete = /* @__PURE__ */ createAutocomplete();
