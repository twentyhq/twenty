import { type ReactNode } from 'react';

import { type CurrencyPickerOption } from '../types/CurrencyPickerOption';

export type PreparedCurrencyPickerOption = {
  currency: CurrencyPickerOption;
  label: ReactNode;
  searchText: string;
};
