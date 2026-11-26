import { isNonEmptyString } from '@sniptt/guards';

import { isPlainObject } from '@/utils/typeguard/isPlainObject';

export const getFieldMetadataFormulaCurrencyCodeExpression = ({
  formula,
}: {
  formula?: unknown;
}): string | undefined =>
  isPlainObject(formula) && isNonEmptyString(formula.currencyCodeExpression)
    ? formula.currencyCodeExpression
    : undefined;
