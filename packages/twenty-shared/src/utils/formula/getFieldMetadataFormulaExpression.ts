import { isNonEmptyString } from '@sniptt/guards';

import { isPlainObject } from '@/utils/typeguard/isPlainObject';

export const getFieldMetadataFormulaExpression = ({
  formula,
}: {
  formula?: unknown;
}): string | undefined =>
  isPlainObject(formula) && isNonEmptyString(formula.expression)
    ? formula.expression
    : undefined;
