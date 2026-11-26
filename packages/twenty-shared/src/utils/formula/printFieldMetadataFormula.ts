import { type FieldMetadataFormula } from '@/types/FieldMetadataFormula';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { buildExpressionFieldPrinter } from '@/utils/expression/buildExpressionFieldPrinter';
import { printExpressionNode } from '@/expression/utils/printExpressionNode';
import { getFieldMetadataFormulaCurrencyCodeExpression } from '@/utils/formula/getFieldMetadataFormulaCurrencyCodeExpression';
import { getFieldMetadataFormulaExpression } from '@/utils/formula/getFieldMetadataFormulaExpression';
import { getFieldMetadataFormulaTree } from '@/utils/formula/getFieldMetadataFormulaTree';
import { isDefined } from '@/utils/validation/isDefined';

export const printFieldMetadataFormula = ({
  formula,
  fields,
}: {
  formula?: Partial<FieldMetadataFormula> | null;
  fields: ValidationRuleFieldDescriptor[];
}): { expression?: string; currencyCodeExpression?: string } => {
  const printField = buildExpressionFieldPrinter({ fields });
  const tree = getFieldMetadataFormulaTree({ formula });

  if (!isDefined(tree)) {
    return {
      expression: getFieldMetadataFormulaExpression({ formula }),
      currencyCodeExpression: getFieldMetadataFormulaCurrencyCodeExpression({
        formula,
      }),
    };
  }

  const currencyCodeTree = getFieldMetadataFormulaTree({
    formula,
    isCurrencyCode: true,
  });

  return {
    expression: printExpressionNode({ node: tree, printField }),
    currencyCodeExpression: isDefined(currencyCodeTree)
      ? printExpressionNode({ node: currencyCodeTree, printField })
      : undefined,
  };
};
