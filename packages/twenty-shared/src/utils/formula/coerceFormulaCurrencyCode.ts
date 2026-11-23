import { isString } from '@sniptt/guards';

import { CurrencyCode } from '@/constants/CurrencyCode';

const CURRENCY_CODES: readonly string[] = Object.values(CurrencyCode);

export const coerceFormulaCurrencyCode = (value: unknown): string | null =>
  isString(value) && CURRENCY_CODES.includes(value) ? value : null;
