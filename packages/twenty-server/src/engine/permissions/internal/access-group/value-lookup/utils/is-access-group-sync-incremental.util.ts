/* @license Enterprise */

import { type AccessGroup } from 'src/engine/permissions/internal/access-group/types/access-group.type';
import { MAX_INCREMENTAL_ACCESS_GROUP_CHANGES_PER_OBJECT } from 'src/engine/permissions/internal/access-group/value-lookup/constants/max-incremental-access-group-changes-per-object.constant';
import { type AccessGroupValueLookup } from 'src/engine/permissions/internal/access-group/value-lookup/types/access-group-value-lookup.type';

export const isAccessGroupSyncIncremental = ({
  changedAccessGroups,
  accessGroupValueLookups,
}: {
  changedAccessGroups: Pick<AccessGroup, 'ruleShapeHash'>[];
  accessGroupValueLookups: Pick<AccessGroupValueLookup, 'ruleShapeHash'>[];
}): boolean =>
  changedAccessGroups.length <=
    MAX_INCREMENTAL_ACCESS_GROUP_CHANGES_PER_OBJECT &&
  changedAccessGroups.every(({ ruleShapeHash }) =>
    accessGroupValueLookups.some(
      (accessGroupValueLookup) =>
        accessGroupValueLookup.ruleShapeHash === ruleShapeHash,
    ),
  );
