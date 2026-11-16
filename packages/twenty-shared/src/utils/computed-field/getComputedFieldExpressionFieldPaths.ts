import { type ComputedFieldExpressionNode } from '@/types/ComputedFieldExpressionNode';
import { getComputedFieldExpressionNodeChildren } from '@/utils/computed-field/internal/getComputedFieldExpressionNodeChildren';
import { parseComputedFieldExpressionOrThrow } from '@/utils/computed-field/parseComputedFieldExpressionOrThrow';

const collectFieldPaths = (node: ComputedFieldExpressionNode): string[][] =>
  node.kind === 'fieldPath'
    ? [node.path]
    : getComputedFieldExpressionNodeChildren(node).flatMap(collectFieldPaths);

// "amount.amountMicros" reads as ['amount', 'amountMicros']: a composite sub-field or a field of a to-one relation
export const getComputedFieldExpressionFieldPaths = (
  expression: string,
): string[][] => {
  const fieldPathByReadablePath = new Map(
    collectFieldPaths(parseComputedFieldExpressionOrThrow(expression)).map(
      (path) => [path.join('.'), path],
    ),
  );

  return [...fieldPathByReadablePath.values()];
};
