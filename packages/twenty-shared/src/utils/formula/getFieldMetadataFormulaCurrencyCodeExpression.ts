import { isNonEmptyString } from '@sniptt/guards';

import { isPlainObject } from '@/utils/typeguard/isPlainObject';

export const getFieldMetadataFormulaCurrencyCodeExpression = ({
  settings,
}: {
  settings?: unknown;
}): string | undefined => {
  if (!isPlainObject(settings)) {
    return undefined;
  }

  const formula = settings.formula;

  if (!isPlainObject(formula)) {
    return undefined;
  }

  return isNonEmptyString(formula.currencyCodeExpression)
    ? formula.currencyCodeExpression
    : undefined;
};
