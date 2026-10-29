import { CurrencyCode } from '@/constants/CurrencyCode';

// Withdrawn codes stay in CurrencyCode so values saved before their replacement keep validating
export const WITHDRAWN_CURRENCY_CODE_REPLACEMENTS: Partial<
  Record<CurrencyCode, CurrencyCode>
> = {
  [CurrencyCode.ANG]: CurrencyCode.XCG,
};
