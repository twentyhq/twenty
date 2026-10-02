import { type CurrencyPickerOptionsProps } from '../src/components/input/CurrencyPicker/types/CurrencyPickerOptionsProps';
import { type CurrencyPickerTriggerProps } from '../src/components/input/CurrencyPicker/types/CurrencyPickerTriggerProps';

export const CURRENCY_PICKER_PART_PROP_DESCRIPTIONS = {
  Trigger: {
    value:
      'Required currency code displayed beside the chevron. The application chooses its initial value and any fallback.',
    disabled: 'Disables opening the picker.',
    render:
      'Replaces the native trigger button. Forward the supplied props and ref when rendering a custom component.',
  } satisfies Partial<Record<keyof CurrencyPickerTriggerProps, string>>,
  Options: {
    currencies:
      'Available currency codes and names, in catalogue order. Each code must be unique. An option can be disabled.',
    value:
      'Selected currency code. Its matching row appears first and is marked pressed.',
    onValueChange:
      'Called with the code chosen by pointer or keyboard. The application updates the selected value.',
    searchLabel: 'Search placeholder and accessible name. Defaults to Search.',
    emptyLabel:
      'Text announced when no currencies match. Defaults to No results.',
    disabled: 'Disables search and every currency option.',
    render:
      'Replaces the non-interactive root div. Forward the supplied props and ref when rendering a custom component.',
  } satisfies Partial<Record<keyof CurrencyPickerOptionsProps, string>>,
};
