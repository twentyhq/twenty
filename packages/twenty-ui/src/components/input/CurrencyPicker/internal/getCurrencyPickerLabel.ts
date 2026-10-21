import { type CurrencyPickerOption } from '../types/CurrencyPickerOption';

export const getCurrencyPickerLabel = ({ code, name }: CurrencyPickerOption) =>
  `${name} (${code})`;
