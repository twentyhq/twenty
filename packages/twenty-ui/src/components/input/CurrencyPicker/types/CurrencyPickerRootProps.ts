import { type ReactNode } from 'react';

import { type CurrencyPickerChangeEventDetails } from './CurrencyPickerChangeEventDetails';
import { type CurrencyPickerOption } from './CurrencyPickerOption';
import { type CurrencyPickerState } from './CurrencyPickerState';

export type CurrencyPickerRootProps = {
  currencies: readonly CurrencyPickerOption[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (
    value: string | null,
    eventDetails: CurrencyPickerChangeEventDetails,
  ) => void;
  closeOnSelect?: boolean;
  disabled?: boolean;
  selectedFirst?: boolean;
  getOptionLabel?: (currency: CurrencyPickerOption) => ReactNode;
  getSearchText?: (currency: CurrencyPickerOption) => string;
  renderValue?: (state: CurrencyPickerState) => ReactNode;
  children: ReactNode | ((state: CurrencyPickerState) => ReactNode);
};
