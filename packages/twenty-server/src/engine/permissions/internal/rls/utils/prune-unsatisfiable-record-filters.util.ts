/* @license Enterprise */

import { RecordFilterGroupLogicalOperator } from 'twenty-shared/types';
import {
  isDefined,
  type RecordFilter,
  type RecordFilterGroup,
} from 'twenty-shared/utils';

type PrunedRecordFilters = {
  recordFilters: RecordFilter[];
  recordFilterGroups: RecordFilterGroup[];
};

type KeptBranches = {
  isSatisfiable: boolean;
  recordFilterIds: string[];
  recordFilterGroupIds: string[];
};

const groupByKey = <TItem>(
  items: TItem[],
  getKey: (item: TItem) => string | null,
): Map<string | null, TItem[]> => {
  const itemsByKey = new Map<string | null, TItem[]>();

  for (const item of items) {
    const key = getKey(item);

    itemsByKey.set(key, [...(itemsByKey.get(key) ?? []), item]);
  }

  return itemsByKey;
};

// An OR group fails when every branch fails, an AND group when one does; the
// root is an AND. Groups holding no filter are dropped. null when nothing can match.
export const pruneUnsatisfiableRecordFilters = ({
  recordFilters,
  recordFilterGroups,
  unsatisfiableRecordFilterIds,
}: PrunedRecordFilters & {
  unsatisfiableRecordFilterIds: Set<string>;
}): PrunedRecordFilters | null => {
  const childGroupsByParentId = groupByKey(
    recordFilterGroups,
    (recordFilterGroup) => recordFilterGroup.parentRecordFilterGroupId ?? null,
  );
  const recordFiltersByGroupId = groupByKey(
    recordFilters,
    (recordFilter) => recordFilter.recordFilterGroupId ?? null,
  );

  const keepSatisfiableBranches = ({
    groupId,
    logicalOperator,
  }: {
    groupId: string | null;
    logicalOperator: RecordFilterGroupLogicalOperator;
  }): KeptBranches | undefined => {
    const satisfiableRecordFilterIds: string[] = [];
    const branchResults: boolean[] = [];

    for (const recordFilter of recordFiltersByGroupId.get(groupId) ?? []) {
      const isSatisfiable = !unsatisfiableRecordFilterIds.has(recordFilter.id);

      branchResults.push(isSatisfiable);

      if (isSatisfiable) {
        satisfiableRecordFilterIds.push(recordFilter.id);
      }
    }

    const satisfiableChildGroups: KeptBranches[] = [];
    const satisfiableChildGroupIds: string[] = [];

    for (const childGroup of childGroupsByParentId.get(groupId) ?? []) {
      const childBranches = keepSatisfiableBranches({
        groupId: childGroup.id,
        logicalOperator: childGroup.logicalOperator,
      });

      if (!isDefined(childBranches)) {
        continue;
      }

      branchResults.push(childBranches.isSatisfiable);

      if (childBranches.isSatisfiable) {
        satisfiableChildGroups.push(childBranches);
        satisfiableChildGroupIds.push(childGroup.id);
      }
    }

    if (branchResults.length === 0) {
      return undefined;
    }

    const isSatisfiable =
      logicalOperator === RecordFilterGroupLogicalOperator.OR
        ? branchResults.some(Boolean)
        : branchResults.every(Boolean);

    if (!isSatisfiable) {
      return { isSatisfiable, recordFilterIds: [], recordFilterGroupIds: [] };
    }

    return {
      isSatisfiable,
      recordFilterIds: [
        ...satisfiableRecordFilterIds,
        ...satisfiableChildGroups.flatMap(
          ({ recordFilterIds }) => recordFilterIds,
        ),
      ],
      recordFilterGroupIds: [
        ...satisfiableChildGroupIds,
        ...satisfiableChildGroups.flatMap(
          ({ recordFilterGroupIds }) => recordFilterGroupIds,
        ),
      ],
    };
  };

  const rootBranches = keepSatisfiableBranches({
    groupId: null,
    logicalOperator: RecordFilterGroupLogicalOperator.AND,
  });

  if (rootBranches?.isSatisfiable === false) {
    return null;
  }

  const keptRecordFilterIds = new Set(rootBranches?.recordFilterIds);
  const keptRecordFilterGroupIds = new Set(rootBranches?.recordFilterGroupIds);

  return {
    recordFilters: recordFilters.filter((recordFilter) =>
      keptRecordFilterIds.has(recordFilter.id),
    ),
    recordFilterGroups: recordFilterGroups.filter((recordFilterGroup) =>
      keptRecordFilterGroupIds.has(recordFilterGroup.id),
    ),
  };
};
