import { type CurrencyPickerOption } from './CurrencyPickerOption';

export type CurrencyPickerState = {
  value: string | null;
  selectedCurrency: CurrencyPickerOption | undefined;
  disabled: boolean;
};
