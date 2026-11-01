import { type CurrencyPickerRootProps } from '../src/components/input/CurrencyPicker/types/CurrencyPickerRootProps';

export const CURRENCY_PICKER_ROOT_PROP_DESCRIPTIONS = {
  currencies:
    'Available currencies in display order. Each code is a unique stable identifier; name and optional symbol are caller-owned data. A currency can be disabled.',
  value:
    'Controlled currency code or null for an empty selection. Undefined leaves selection uncontrolled. Empty and unknown strings remain identifiers.',
  defaultValue:
    'Initial uncontrolled currency code, or null for an empty selection. Defaults to null.',
  onValueChange:
    'Called with the next code or null and cancellable Dropdown selection details: event, reason, trigger, cancel and isCanceled. Calling cancel() preserves selection and prevents automatic close. Repeated single selection does not emit a change.',
  closeOnSelect:
    'Whether committing an enabled option closes the dropdown. Defaults to true. A canceled selection never closes automatically.',
  disabled: 'Disables the trigger, search input, and every currency option.',
  selectedFirst:
    'Moves the matching selected currency before other results. Defaults to false, preserving catalogue order.',
  getOptionLabel:
    'Returns caller-owned content for a currency option. Defaults to Name (CODE). Display content does not change the search text.',
  getSearchText:
    'Returns searchable text for a currency. Defaults to Name (CODE) and its optional symbol. Search trims the query and matches without case sensitivity.',
  renderValue:
    'Returns selected trigger content from { value, selectedCurrency, disabled }. The default display is the raw code, or the trigger placeholder when null. Trigger children override it.',
  children:
    'Picker parts and supporting content, or a render function receiving { value, selectedCurrency, disabled }. Root owns selection and prepared data without adding a DOM element.',
} satisfies Partial<Record<keyof CurrencyPickerRootProps, string>>;
