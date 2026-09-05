/* @license Enterprise */

import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  type BuildRowLevelPermissionRecordFilterForParentArgs,
  buildRowLevelPermissionRecordFilterForParent,
} from 'src/engine/twenty-orm/utils/build-row-level-permission-record-filter-for-parent.util';

type BuildRowLevelPermissionRecordFilterArgs = Omit<
  BuildRowLevelPermissionRecordFilterForParentArgs,
  'parent'
> & {
  roleIds: string[];
};

// Each role compiles on its own and the results are ANDed. Merging the raw
// predicates first would be wrong: compilation honours only the first
// parentless group, so one role's restrictions would vanish and widen access.
export const buildRowLevelPermissionRecordFilter = ({
  roleIds,
  ...buildRecordFilterForParentArgs
}: BuildRowLevelPermissionRecordFilterArgs): RecordGqlOperationFilter | null => {
  const recordFilters = roleIds
    .map((roleId) =>
      buildRowLevelPermissionRecordFilterForParent({
        ...buildRecordFilterForParentArgs,
        parent: { roleId, sharingRuleId: null },
      }),
    )
    .filter(isDefined)
    .filter((recordFilter) => Object.keys(recordFilter).length > 0);

  if (recordFilters.length === 0) {
    return null;
  }

  if (recordFilters.length === 1) {
    return recordFilters[0];
  }

  return { and: recordFilters };
};
