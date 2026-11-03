import { isBoolean } from '@sniptt/guards';

import { NEVER_AVAILABLE_CONDITIONAL_DISPLAY } from '@/constants/NeverAvailableConditionalDisplay';
import { type ConditionalAvailabilityExpressionNode } from '@/types/conditional-display/ConditionalAvailabilityExpressionNode';
import { type ConditionalDisplay } from '@/types/conditional-display/ConditionalDisplay';
import { type ConditionalDisplayConditionNode } from '@/types/conditional-display/ConditionalDisplayConditionNode';
import { type ConditionalAvailabilityCompiledItem } from '@/types/conditional-display/internal/ConditionalAvailabilityCompiledItem';
import { FieldMetadataType } from '@/types/FieldMetadataType';
import { RecordFilterGroupLogicalOperator } from '@/types/RecordFilterGroupLogicalOperator';
import { ViewFilterOperand } from '@/types/ViewFilterOperand';
import { buildConditionalDisplayFromConditionNode } from '@/utils/conditional-display/buildConditionalDisplayFromConditionNode';
import { groupConditionalDisplayConditionNodes } from '@/utils/conditional-display/groupConditionalDisplayConditionNodes';
import { buildConditionalAvailabilityCompilationError } from '@/utils/conditional-display/internal/buildConditionalAvailabilityCompilationError';
import { buildConditionalDisplayContextConditionNode } from '@/utils/conditional-display/internal/buildConditionalDisplayContextConditionNode';
import { compileConditionalAvailabilityComparison } from '@/utils/conditional-display/internal/compileConditionalAvailabilityComparison';
import { compileConditionalAvailabilityFunctionCall } from '@/utils/conditional-display/internal/compileConditionalAvailabilityFunctionCall';
import { compileConditionalAvailabilityOperand } from '@/utils/conditional-display/internal/compileConditionalAvailabilityOperand';
import { describeConditionalAvailabilityCompiledItem } from '@/utils/conditional-display/internal/describeConditionalAvailabilityCompiledItem';
import { getConditionalAvailabilitySelectedRecordsUnsupportedReason } from '@/utils/conditional-display/internal/getConditionalAvailabilitySelectedRecordsUnsupportedReason';
import { resolveConditionalAvailabilitySubject } from '@/utils/conditional-display/internal/resolveConditionalAvailabilitySubject';
import { negateConditionalDisplayConditionNode } from '@/utils/conditional-display/negateConditionalDisplayConditionNode';
import { isDefined } from '@/utils/validation/isDefined';

const SUPPORTED_FUNCTION_NAMES = [
  'isDefined',
  'isNonEmptyString',
  'includes',
  'arrayLength',
  'every',
  'everyDefined',
  'everyEquals',
  'some',
  'someDefined',
  'someEquals',
  'someNonEmptyString',
  'none',
  'noneDefined',
  'noneEquals',
  'includesEvery',
  'includesSome',
  'includesNone',
];

export const compileConditionalAvailabilityExpressionNode = ({
  expressionNode,
  expression,
  source,
}: {
  expressionNode: ConditionalAvailabilityExpressionNode;
  expression: string;
  source: string;
}): ConditionalDisplay | null => {
  const fail = (reason: string): never => {
    throw buildConditionalAvailabilityCompilationError({ expression, reason });
  };

  const toConditionNode = (
    compiledItem: ConditionalAvailabilityCompiledItem,
  ): ConditionalDisplayConditionNode => {
    if (
      compiledItem.kind === 'recordFilter' ||
      compiledItem.kind === 'recordFilterGroup'
    ) {
      return compiledItem;
    }

    const subject = resolveConditionalAvailabilitySubject(compiledItem);

    return subject?.virtualField.type === FieldMetadataType.BOOLEAN
      ? buildConditionalDisplayContextConditionNode(
          subject,
          ViewFilterOperand.IS,
          JSON.stringify(true),
        )
      : fail(
          `unsupported ${describeConditionalAvailabilityCompiledItem(compiledItem)}`,
        );
  };

  const compile = (
    node: ConditionalAvailabilityExpressionNode,
  ): ConditionalAvailabilityCompiledItem => {
    switch (node.kind) {
      case 'literal':
      case 'list':
      case 'variable':
      case 'member':
        return compileConditionalAvailabilityOperand({
          node,
          compileOperand: compile,
          expression,
        });
      case 'not': {
        const operand = compile(node.operand);

        return (
          negateConditionalDisplayConditionNode(toConditionNode(operand)) ??
          fail(
            `unsupported operator "not" on ${describeConditionalAvailabilityCompiledItem(operand)}`,
          )
        );
      }
      case 'logicalOperation': {
        const left = compile(node.left);
        const right = compile(node.right);

        return groupConditionalDisplayConditionNodes({
          logicalOperator:
            node.operator === 'and'
              ? RecordFilterGroupLogicalOperator.AND
              : RecordFilterGroupLogicalOperator.OR,
          conditionNodes: [toConditionNode(left), toConditionNode(right)],
        });
      }
      case 'comparison':
        return compileConditionalAvailabilityComparison({
          operator: node.operator,
          left: compile(node.left),
          right: compile(node.right),
          expression,
        });
      case 'functionCall':
        if (!SUPPORTED_FUNCTION_NAMES.includes(node.functionName)) {
          return fail(`unsupported function "${node.functionName}"`);
        }

        return compileConditionalAvailabilityFunctionCall({
          functionName: node.functionName,
          functionArguments: node.functionArguments.map(compile),
          expression,
        });
    }
  };

  const compiledItem = compile(expressionNode);

  if (compiledItem.kind === 'literal' && isBoolean(compiledItem.value)) {
    return compiledItem.value ? null : NEVER_AVAILABLE_CONDITIONAL_DISPLAY;
  }

  const conditionNode = toConditionNode(compiledItem);
  const unsupportedReason =
    getConditionalAvailabilitySelectedRecordsUnsupportedReason(conditionNode);

  if (isDefined(unsupportedReason)) {
    return fail(unsupportedReason);
  }

  return buildConditionalDisplayFromConditionNode({ conditionNode, source });
};
