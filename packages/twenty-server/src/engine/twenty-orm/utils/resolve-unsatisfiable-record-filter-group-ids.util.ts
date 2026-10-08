import { RecordFilterGroupLogicalOperator } from 'twenty-shared/types';
import {
  isDefined,
  type RecordFilter,
  type RecordFilterGroup,
} from 'twenty-shared/utils';

// A group cannot be satisfied when every branch of an OR fails, or when any
// branch of an AND does. Propagating branch by branch keeps a denied branch
// from denying the disjunction it sits in.
export const resolveUnsatisfiableRecordFilterGroupIds = ({
  recordFilters,
  recordFilterGroups,
  unsatisfiableRecordFilterIds,
}: {
  recordFilters: RecordFilter[];
  recordFilterGroups: RecordFilterGroup[];
  unsatisfiableRecordFilterIds: Set<string>;
}): Set<string> => {
  const recordFilterGroupById = new Map(
    recordFilterGroups.map((recordFilterGroup) => [
      recordFilterGroup.id,
      recordFilterGroup,
    ]),
  );
  const childGroupIdsByParentGroupId = new Map<string, string[]>();
  const recordFilterIdsByGroupId = new Map<string, string[]>();

  for (const recordFilterGroup of recordFilterGroups) {
    const parentGroupId = recordFilterGroup.parentRecordFilterGroupId;

    if (isDefined(parentGroupId)) {
      childGroupIdsByParentGroupId.set(parentGroupId, [
        ...(childGroupIdsByParentGroupId.get(parentGroupId) ?? []),
        recordFilterGroup.id,
      ]);
    }
  }

  for (const recordFilter of recordFilters) {
    const groupId = recordFilter.recordFilterGroupId;

    if (isDefined(groupId)) {
      recordFilterIdsByGroupId.set(groupId, [
        ...(recordFilterIdsByGroupId.get(groupId) ?? []),
        recordFilter.id,
      ]);
    }
  }

  const unsatisfiableGroupIds = new Set<string>();
  const visitedGroupIds = new Set<string>();

  const isGroupUnsatisfiable = (groupId: string): boolean => {
    const recordFilterGroup = recordFilterGroupById.get(groupId);

    if (!isDefined(recordFilterGroup) || visitedGroupIds.has(groupId)) {
      return unsatisfiableGroupIds.has(groupId);
    }

    visitedGroupIds.add(groupId);

    const branches = [
      ...(recordFilterIdsByGroupId.get(groupId) ?? []).map((recordFilterId) =>
        unsatisfiableRecordFilterIds.has(recordFilterId),
      ),
      ...(childGroupIdsByParentGroupId.get(groupId) ?? []).map(
        isGroupUnsatisfiable,
      ),
    ];

    const isUnsatisfiable =
      branches.length > 0 &&
      (recordFilterGroup.logicalOperator === RecordFilterGroupLogicalOperator.OR
        ? branches.every(Boolean)
        : branches.some(Boolean));

    if (isUnsatisfiable) {
      unsatisfiableGroupIds.add(groupId);
    }

    return isUnsatisfiable;
  };

  for (const recordFilterGroup of recordFilterGroups) {
    isGroupUnsatisfiable(recordFilterGroup.id);
  }

  return unsatisfiableGroupIds;
};
