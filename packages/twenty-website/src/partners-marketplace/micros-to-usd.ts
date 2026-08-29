import { type CurrencyValue } from './marketplace-api-types';

export const microsToUsd = (currency: CurrencyValue): number | null =>
  currency && typeof currency.amountMicros === 'number'
    ? Math.round(currency.amountMicros / 1_000_000)
    : null;
