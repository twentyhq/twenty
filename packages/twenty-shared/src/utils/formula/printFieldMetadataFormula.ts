import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { buildExpressionFieldPrinter } from '@/utils/expression/buildExpressionFieldPrinter';
import { printExpressionNode } from '@/expression/utils/printExpressionNode';
import { getFieldMetadataFormulaCurrencyCodeExpression } from '@/utils/formula/getFieldMetadataFormulaCurrencyCodeExpression';
import { getFieldMetadataFormulaExpression } from '@/utils/formula/getFieldMetadataFormulaExpression';
import { getFieldMetadataFormulaTree } from '@/utils/formula/getFieldMetadataFormulaTree';
import { isDefined } from '@/utils/validation/isDefined';

// The formula as text, with the current field names, from its trees or from the text a client sent
export const printFieldMetadataFormula = ({
  settings,
  fields,
}: {
  settings?: unknown;
  fields: ValidationRuleFieldDescriptor[];
}): { expression?: string; currencyCodeExpression?: string } => {
  const printField = buildExpressionFieldPrinter({ fields });
  const tree = getFieldMetadataFormulaTree({ settings });

  if (!isDefined(tree)) {
    return {
      expression: getFieldMetadataFormulaExpression({ settings }),
      currencyCodeExpression: getFieldMetadataFormulaCurrencyCodeExpression({
        settings,
      }),
    };
  }

  const currencyCodeTree = getFieldMetadataFormulaTree({
    settings,
    isCurrencyCode: true,
  });

  return {
    expression: printExpressionNode({ node: tree, printField }),
    currencyCodeExpression: isDefined(currencyCodeTree)
      ? printExpressionNode({ node: currencyCodeTree, printField })
      : undefined,
  };
};
