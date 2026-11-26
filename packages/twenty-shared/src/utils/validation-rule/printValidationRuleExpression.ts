import { printExpressionNode } from '@/expression/utils/printExpressionNode';
import { type StoredExpressionTree } from '@/types/StoredExpressionTree';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { buildExpressionFieldPrinter } from '@/utils/expression/buildExpressionFieldPrinter';
import { isDefined } from '@/utils/validation/isDefined';
import { getValidationRuleTree } from '@/utils/validation-rule/getValidationRuleTree';

export const printValidationRuleExpression = ({
  tree,
  fields,
}: {
  tree?: StoredExpressionTree | null;
  fields: ValidationRuleFieldDescriptor[];
}): string | undefined => {
  const validationRuleTree = getValidationRuleTree({ tree });

  return isDefined(validationRuleTree)
    ? printExpressionNode({
        node: validationRuleTree,
        printField: buildExpressionFieldPrinter({ fields }),
      })
    : undefined;
};
