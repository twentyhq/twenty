import { CurrencyPickerOptions } from './internal/CurrencyPickerOptions';
import { CurrencyPickerRoot } from './internal/CurrencyPickerRoot';
import { CurrencyPickerShorthand } from './internal/CurrencyPickerShorthand';
import { CurrencyPickerTrigger } from './internal/CurrencyPickerTrigger';

export const CurrencyPicker = Object.assign(CurrencyPickerShorthand, {
  Root: CurrencyPickerRoot,
  Trigger: CurrencyPickerTrigger,
  Options: CurrencyPickerOptions,
});
