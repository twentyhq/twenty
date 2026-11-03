import { type ConditionalDisplaySelectedRecordsMatch } from '@/types/conditional-display/ConditionalDisplaySelectedRecordsMatch';
import { type ConditionalAvailabilitySubject } from '@/types/conditional-display/internal/ConditionalAvailabilitySubject';
import { type ConditionalDisplayRecordFilterConditionNode } from '@/types/conditional-display/internal/ConditionalDisplayRecordFilterConditionNode';
import { type ViewFilterOperand } from '@/types/ViewFilterOperand';
import { isDefined } from '@/utils/validation/isDefined';

export const buildConditionalDisplayContextConditionNode = (
  { contextKey, subFieldName }: ConditionalAvailabilitySubject,
  operand: ViewFilterOperand,
  value?: string,
  selectedRecordsMatch?: ConditionalDisplaySelectedRecordsMatch,
): ConditionalDisplayRecordFilterConditionNode => {
  const conditionNode: ConditionalDisplayRecordFilterConditionNode = {
    kind: 'recordFilter',
    recordFilter: { contextKey, operand },
  };

  if (isDefined(subFieldName)) {
    conditionNode.recordFilter.subFieldName = subFieldName;
  }

  if (isDefined(value)) {
    conditionNode.recordFilter.value = value;
  }

  if (isDefined(selectedRecordsMatch)) {
    conditionNode.selectedRecordsMatch = selectedRecordsMatch;
  }

  return conditionNode;
};
