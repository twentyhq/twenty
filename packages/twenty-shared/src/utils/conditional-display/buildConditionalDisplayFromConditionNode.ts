import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from '@/application/constants/TwentyStandardApplicationUniversalIdentifier';
import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';
import { type ConditionalDisplay } from '@/types/conditional-display/ConditionalDisplay';
import { type ConditionalDisplayConditionNode } from '@/types/conditional-display/ConditionalDisplayConditionNode';
import { type ConditionalDisplayRecordFilter } from '@/types/conditional-display/ConditionalDisplayRecordFilter';
import { type ConditionalDisplayRecordFilterGroup } from '@/types/conditional-display/ConditionalDisplayRecordFilterGroup';
import { RecordFilterGroupLogicalOperator } from '@/types/RecordFilterGroupLogicalOperator';
import { isDefined } from '@/utils/validation/isDefined';

export const buildConditionalDisplayFromConditionNode = ({
  conditionNode,
  source,
}: {
  conditionNode: ConditionalDisplayConditionNode;
  source: string;
}): ConditionalDisplay => {
  const recordFilters: ConditionalDisplayRecordFilter[] = [];
  const recordFilterGroups: ConditionalDisplayRecordFilterGroup[] = [];
  let index = 0;
  let hasSomeSelectedRecordsMatch = false;

  const generateId = () => {
    const id = computeDeterministicUuid({
      entityNamespace: 'conditionalDisplay',
      value: `${source}:${index}`,
      applicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    index += 1;

    return id;
  };

  const emit = (
    node: ConditionalDisplayConditionNode,
    recordFilterGroupId?: string,
    positionInRecordFilterGroup?: number,
  ) => {
    if (node.kind === 'recordFilter') {
      const recordFilter: ConditionalDisplayRecordFilter = {
        id: generateId(),
        ...node.recordFilter,
      };

      if (isDefined(recordFilterGroupId)) {
        recordFilter.recordFilterGroupId = recordFilterGroupId;
        recordFilter.positionInRecordFilterGroup = positionInRecordFilterGroup;
      }

      hasSomeSelectedRecordsMatch ||= node.selectedRecordsMatch === 'SOME';
      recordFilters.push(recordFilter);

      return;
    }

    const recordFilterGroup: ConditionalDisplayRecordFilterGroup = {
      id: generateId(),
      logicalOperator: node.logicalOperator,
    };

    if (isDefined(recordFilterGroupId)) {
      recordFilterGroup.parentRecordFilterGroupId = recordFilterGroupId;
      recordFilterGroup.positionInRecordFilterGroup =
        positionInRecordFilterGroup;
    }

    recordFilterGroups.push(recordFilterGroup);
    node.children.forEach((child, position) =>
      emit(child, recordFilterGroup.id, position),
    );
  };

  const isConjunctionOfRecordFilters =
    conditionNode.kind === 'recordFilterGroup' &&
    conditionNode.logicalOperator === RecordFilterGroupLogicalOperator.AND &&
    conditionNode.children.every((child) => child.kind === 'recordFilter');

  (isConjunctionOfRecordFilters
    ? conditionNode.children
    : [conditionNode]
  ).forEach((node) => emit(node));

  const conditionalDisplay: ConditionalDisplay = { recordFilters };

  if (recordFilterGroups.length > 0) {
    conditionalDisplay.recordFilterGroups = recordFilterGroups;
  }

  if (hasSomeSelectedRecordsMatch) {
    conditionalDisplay.selectedRecordsMatch = 'SOME';
  }

  return conditionalDisplay;
};
