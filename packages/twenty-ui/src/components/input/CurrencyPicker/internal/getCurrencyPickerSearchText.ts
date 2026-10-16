import { type CurrencyPickerOption } from '../types/CurrencyPickerOption';
import { getCurrencyPickerLabel } from './getCurrencyPickerLabel';

export const getCurrencyPickerSearchText = (currency: CurrencyPickerOption) =>
  `${getCurrencyPickerLabel(currency)} ${currency.symbol ?? ''}`;
