import { printExpressionNode } from '@/expression/utils/printExpressionNode';
import { parseStoredExpressionTree } from '@/expression/utils/parseStoredExpressionTree';
import { type StoredExpressionTree } from '@/types/StoredExpressionTree';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { buildExpressionFieldPrinter } from '@/utils/expression/buildExpressionFieldPrinter';
import { isDefined } from '@/utils/validation/isDefined';

export const printValidationRuleExpression = ({
  tree,
  fields,
}: {
  tree?: StoredExpressionTree | null;
  fields: ValidationRuleFieldDescriptor[];
}): string | undefined => {
  const validationRuleTree = parseStoredExpressionTree({ tree });

  return isDefined(validationRuleTree)
    ? printExpressionNode({
        node: validationRuleTree,
        printField: buildExpressionFieldPrinter({ fields }),
      })
    : undefined;
};
