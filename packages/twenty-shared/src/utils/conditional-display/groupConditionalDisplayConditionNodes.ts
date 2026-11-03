import { type ConditionalDisplayConditionNode } from '@/types/conditional-display/ConditionalDisplayConditionNode';
import { type RecordFilterGroupLogicalOperator } from '@/types/RecordFilterGroupLogicalOperator';
import { isDefined } from '@/utils/validation/isDefined';

export const groupConditionalDisplayConditionNodes = ({
  logicalOperator,
  conditionNodes,
}: {
  logicalOperator: RecordFilterGroupLogicalOperator;
  conditionNodes: ConditionalDisplayConditionNode[];
}): ConditionalDisplayConditionNode => {
  const children = conditionNodes.flatMap((conditionNode) =>
    conditionNode.kind === 'recordFilterGroup' &&
    conditionNode.logicalOperator === logicalOperator
      ? conditionNode.children
      : [conditionNode],
  );

  const [onlyChild, ...otherChildren] = children;

  if (isDefined(onlyChild) && otherChildren.length === 0) {
    return onlyChild;
  }

  return { kind: 'recordFilterGroup', logicalOperator, children };
};
