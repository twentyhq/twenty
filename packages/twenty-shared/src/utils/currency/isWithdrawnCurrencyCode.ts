import { WITHDRAWN_CURRENCY_CODE_REPLACEMENTS } from '@/constants/WithdrawnCurrencyCodeReplacements';

export const isWithdrawnCurrencyCode = (currencyCode: string): boolean =>
  Object.keys(WITHDRAWN_CURRENCY_CODE_REPLACEMENTS).includes(currencyCode);
