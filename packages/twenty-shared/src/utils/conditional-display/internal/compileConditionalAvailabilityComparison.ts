import { isBoolean, isNumber, isString } from '@sniptt/guards';

import { CONDITIONAL_AVAILABILITY_FAVORITE_RECORD_IDS_VARIABLE_NAME } from '@/constants/internal/ConditionalAvailabilityFavoriteRecordIdsVariableName';
import { type ConditionalDisplayConditionNode } from '@/types/conditional-display/ConditionalDisplayConditionNode';
import { type ConditionalAvailabilityComparisonOperator } from '@/types/conditional-display/internal/ConditionalAvailabilityComparisonOperator';
import { type ConditionalAvailabilityCompiledItem } from '@/types/conditional-display/internal/ConditionalAvailabilityCompiledItem';
import { type ConditionalAvailabilityExpressionLiteral } from '@/types/conditional-display/internal/ConditionalAvailabilityExpressionLiteral';
import { type ConditionalAvailabilitySubject } from '@/types/conditional-display/internal/ConditionalAvailabilitySubject';
import { FieldMetadataType } from '@/types/FieldMetadataType';
import { ViewFilterOperand } from '@/types/ViewFilterOperand';
import { buildConditionalAvailabilityCompilationError } from '@/utils/conditional-display/internal/buildConditionalAvailabilityCompilationError';
import { buildConditionalDisplayContextConditionNode } from '@/utils/conditional-display/internal/buildConditionalDisplayContextConditionNode';
import { describeConditionalAvailabilityCompiledItem } from '@/utils/conditional-display/internal/describeConditionalAvailabilityCompiledItem';
import { resolveConditionalAvailabilitySubject } from '@/utils/conditional-display/internal/resolveConditionalAvailabilitySubject';
import { isDefined } from '@/utils/validation/isDefined';

const compileCountComparison = (
  subject: ConditionalAvailabilitySubject,
  operator: ConditionalAvailabilityComparisonOperator,
  count: number,
) => {
  const bound = (operand: ViewFilterOperand, boundary: number) =>
    boundary < 0
      ? undefined
      : buildConditionalDisplayContextConditionNode(
          subject,
          operand,
          JSON.stringify(boundary),
        );

  switch (operator) {
    case '==':
      return bound(ViewFilterOperand.IS, count);
    case '!=':
      return bound(ViewFilterOperand.IS_NOT, count);
    case '>=':
      return bound(ViewFilterOperand.GREATER_THAN_OR_EQUAL, count);
    case '>':
      return bound(ViewFilterOperand.GREATER_THAN_OR_EQUAL, count + 1);
    case '<=':
      return bound(ViewFilterOperand.LESS_THAN_OR_EQUAL, count);
    case '<':
      return bound(ViewFilterOperand.LESS_THAN_OR_EQUAL, count - 1);
  }
};

const compileContextComparison = (
  left: ConditionalAvailabilityCompiledItem,
  operator: ConditionalAvailabilityComparisonOperator,
  literal: ConditionalAvailabilityExpressionLiteral,
) => {
  const subject = resolveConditionalAvailabilitySubject(left);
  const isEquality = operator === '==' || operator === '!=';
  const options = subject?.virtualField.options;

  switch (subject?.virtualField.type) {
    case FieldMetadataType.BOOLEAN:
      return isEquality && isBoolean(literal)
        ? buildConditionalDisplayContextConditionNode(
            subject,
            ViewFilterOperand.IS,
            JSON.stringify(operator === '==' ? literal : !literal),
          )
        : undefined;
    case FieldMetadataType.SELECT:
      return isEquality &&
        isString(literal) &&
        (!isDefined(options) || options.includes(literal))
        ? buildConditionalDisplayContextConditionNode(
            subject,
            operator === '==' ? ViewFilterOperand.IS : ViewFilterOperand.IS_NOT,
            JSON.stringify([literal]),
          )
        : undefined;
    case FieldMetadataType.NUMBER:
      return isNumber(literal) && Number.isInteger(literal)
        ? compileCountComparison(subject, operator, literal)
        : undefined;
    default:
      return undefined;
  }
};

export const compileConditionalAvailabilityComparison = ({
  operator,
  left,
  right,
  expression,
}: {
  operator: ConditionalAvailabilityComparisonOperator;
  left: ConditionalAvailabilityCompiledItem;
  right: ConditionalAvailabilityCompiledItem;
  expression: string;
}): ConditionalDisplayConditionNode => {
  if (
    left.kind === 'favoriteRecordCount' &&
    right.kind === 'reference' &&
    right.name === 'numberOfSelectedRecords' &&
    ['<', '!=', '=='].includes(operator)
  ) {
    return buildConditionalDisplayContextConditionNode(
      { contextKey: 'areAllSelectedRecordsFavorites' },
      ViewFilterOperand.IS,
      JSON.stringify(operator === '=='),
    );
  }

  if (
    left.kind === 'favoriteRecordCount' ||
    right.kind === 'favoriteRecordCount'
  ) {
    throw buildConditionalAvailabilityCompilationError({
      expression,
      reason: `unsupported comparison of ${CONDITIONAL_AVAILABILITY_FAVORITE_RECORD_IDS_VARIABLE_NAME}.length: write ${CONDITIONAL_AVAILABILITY_FAVORITE_RECORD_IDS_VARIABLE_NAME}.length == numberOfSelectedRecords when every selected record is a favorite, or ${CONDITIONAL_AVAILABILITY_FAVORITE_RECORD_IDS_VARIABLE_NAME}.length < numberOfSelectedRecords when at least one is not`,
    });
  }

  const conditionNode =
    right.kind === 'literal'
      ? compileContextComparison(left, operator, right.value)
      : undefined;

  if (!isDefined(conditionNode)) {
    throw buildConditionalAvailabilityCompilationError({
      expression,
      reason: `unsupported operator "${operator}" between ${describeConditionalAvailabilityCompiledItem(left)} and ${describeConditionalAvailabilityCompiledItem(right)}`,
    });
  }

  return conditionNode;
};
