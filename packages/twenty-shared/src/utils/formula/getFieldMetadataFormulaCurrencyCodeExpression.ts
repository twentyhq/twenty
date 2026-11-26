import { isNonEmptyString } from '@sniptt/guards';

import { type FieldMetadataFormula } from '@/types/FieldMetadataFormula';

export const getFieldMetadataFormulaCurrencyCodeExpression = ({
  formula,
}: {
  formula?: Partial<FieldMetadataFormula> | null;
}): string | undefined =>
  isNonEmptyString(formula?.currencyCodeExpression)
    ? formula.currencyCodeExpression
    : undefined;
