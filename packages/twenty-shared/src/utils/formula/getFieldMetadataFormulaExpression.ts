import { isNonEmptyString } from '@sniptt/guards';

import { type FieldMetadataFormula } from '@/types/FieldMetadataFormula';

export const getFieldMetadataFormulaExpression = ({
  formula,
}: {
  formula?: Partial<Pick<FieldMetadataFormula, 'expression'>> | null;
}): string | undefined =>
  isNonEmptyString(formula?.expression) ? formula.expression : undefined;
