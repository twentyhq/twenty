import { type FieldMetadataFormula } from '@/types/FieldMetadataFormula';
import { getFieldMetadataFormulaExpression } from '@/utils/formula/getFieldMetadataFormulaExpression';
import { isDefined } from '@/utils/validation/isDefined';

export const isFormulaFieldMetadata = ({
  formula,
}: {
  formula?: Partial<FieldMetadataFormula> | null;
}): boolean => isDefined(getFieldMetadataFormulaExpression({ formula }));
