import { type FieldMetadataFormula } from '@/types/FieldMetadataFormula';
import { getFieldMetadataFormulaExpression } from '@/utils/formula/getFieldMetadataFormulaExpression';
import { getFieldMetadataFormulaTree } from '@/utils/formula/getFieldMetadataFormulaTree';
import { isDefined } from '@/utils/validation/isDefined';

export const isFormulaFieldMetadata = ({
  formula,
}: {
  formula?: Partial<Pick<FieldMetadataFormula, 'expression' | 'tree'>> | null;
}): boolean =>
  isDefined(getFieldMetadataFormulaTree({ formula })) ||
  isDefined(getFieldMetadataFormulaExpression({ formula }));
