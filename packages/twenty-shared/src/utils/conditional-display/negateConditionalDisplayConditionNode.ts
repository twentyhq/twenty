import { isNumber } from '@sniptt/guards';

import { type ConditionalDisplayConditionNode } from '@/types/conditional-display/ConditionalDisplayConditionNode';
import { type ConditionalDisplayRecordFilterConditionNode } from '@/types/conditional-display/internal/ConditionalDisplayRecordFilterConditionNode';
import { FieldMetadataType } from '@/types/FieldMetadataType';
import { RecordFilterGroupLogicalOperator } from '@/types/RecordFilterGroupLogicalOperator';
import { ViewFilterOperand } from '@/types/ViewFilterOperand';
import { getConditionalDisplayContextVirtualField } from '@/utils/conditional-display/getConditionalDisplayContextVirtualField';
import { isConditionalDisplayAdminContextKey } from '@/utils/conditional-display/isConditionalDisplayAdminContextKey';
import { parseJson } from '@/utils/parseJson';
import { isDefined } from '@/utils/validation/isDefined';

type RecordFilter = ConditionalDisplayRecordFilterConditionNode['recordFilter'];

const shiftCountBoundary = (
  recordFilter: RecordFilter,
  operand: ViewFilterOperand,
  offset: number,
): RecordFilter | undefined => {
  const boundary = parseJson<unknown>(recordFilter.value);

  return isNumber(boundary) &&
    Number.isInteger(boundary) &&
    boundary + offset >= 0
    ? { ...recordFilter, operand, value: JSON.stringify(boundary + offset) }
    : undefined;
};

const negateRecordFilter = (
  recordFilter: RecordFilter,
): RecordFilter | undefined => {
  const { contextKey, subFieldName, operand, value } = recordFilter;

  if (
    isDefined(contextKey) &&
    (contextKey === 'selectedRecords' ||
      isConditionalDisplayAdminContextKey(contextKey))
  ) {
    return undefined;
  }

  const virtualFieldType = isDefined(contextKey)
    ? getConditionalDisplayContextVirtualField({ contextKey, subFieldName })
        ?.type
    : undefined;

  if (virtualFieldType === FieldMetadataType.BOOLEAN) {
    return operand === ViewFilterOperand.IS &&
      (value === 'true' || value === 'false')
      ? { ...recordFilter, value: JSON.stringify(value === 'false') }
      : undefined;
  }

  const isCount = virtualFieldType === FieldMetadataType.NUMBER;

  switch (operand) {
    case ViewFilterOperand.IS:
      return { ...recordFilter, operand: ViewFilterOperand.IS_NOT };
    case ViewFilterOperand.IS_NOT:
      return { ...recordFilter, operand: ViewFilterOperand.IS };
    case ViewFilterOperand.IS_EMPTY:
      return { ...recordFilter, operand: ViewFilterOperand.IS_NOT_EMPTY };
    case ViewFilterOperand.IS_NOT_EMPTY:
      return { ...recordFilter, operand: ViewFilterOperand.IS_EMPTY };
    case ViewFilterOperand.CONTAINS:
      return { ...recordFilter, operand: ViewFilterOperand.DOES_NOT_CONTAIN };
    case ViewFilterOperand.DOES_NOT_CONTAIN:
      return { ...recordFilter, operand: ViewFilterOperand.CONTAINS };
    case ViewFilterOperand.GREATER_THAN_OR_EQUAL:
      return isCount
        ? shiftCountBoundary(
            recordFilter,
            ViewFilterOperand.LESS_THAN_OR_EQUAL,
            -1,
          )
        : undefined;
    case ViewFilterOperand.LESS_THAN_OR_EQUAL:
      return isCount
        ? shiftCountBoundary(
            recordFilter,
            ViewFilterOperand.GREATER_THAN_OR_EQUAL,
            1,
          )
        : undefined;
    default:
      return undefined;
  }
};

export const negateConditionalDisplayConditionNode = (
  conditionNode: ConditionalDisplayConditionNode,
): ConditionalDisplayConditionNode | undefined => {
  if (conditionNode.kind === 'recordFilter') {
    const recordFilter = negateRecordFilter(conditionNode.recordFilter);

    return isDefined(recordFilter)
      ? { ...conditionNode, recordFilter }
      : undefined;
  }

  const children = conditionNode.children.map(
    negateConditionalDisplayConditionNode,
  );

  if (!children.every(isDefined)) {
    return undefined;
  }

  return {
    kind: 'recordFilterGroup',
    logicalOperator:
      conditionNode.logicalOperator === RecordFilterGroupLogicalOperator.AND
        ? RecordFilterGroupLogicalOperator.OR
        : RecordFilterGroupLogicalOperator.AND,
    children,
  };
};
