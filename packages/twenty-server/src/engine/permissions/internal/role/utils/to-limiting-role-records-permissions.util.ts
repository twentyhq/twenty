import { type ObjectRecordsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  type LimitingObjectRecordsPermissions,
  type LimitingRoleRecordsPermissions,
} from 'src/engine/permissions/types/limiting-role-records-permissions.type';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

const toLimitingObjectRecordsPermissions = ({
  rowLevelRecordsPermissions,
  ...objectRecordsPermissions
}: ObjectRecordsPermissions): LimitingObjectRecordsPermissions =>
  isDefined(rowLevelRecordsPermissions)
    ? {
        ...objectRecordsPermissions,
        canCreateAllRecords: rowLevelRecordsPermissions.canCreateRecords,
        canReadAllRecords: rowLevelRecordsPermissions.canReadRecords,
        canUpdateAllRecords: rowLevelRecordsPermissions.canUpdateRecords,
        canSoftDeleteAllRecords:
          rowLevelRecordsPermissions.canSoftDeleteRecords,
        canDestroyAllRecords: rowLevelRecordsPermissions.canDestroyRecords,
      }
    : objectRecordsPermissions;

export const toLimitingRoleRecordsPermissions = (
  recordsPermissions: RoleRecordsPermissions,
): LimitingRoleRecordsPermissions => ({
  ...recordsPermissions,
  objects: Object.fromEntries(
    Object.entries(recordsPermissions.objects).map(
      ([objectMetadataId, objectRecordsPermissions]) => [
        objectMetadataId,
        isDefined(objectRecordsPermissions)
          ? toLimitingObjectRecordsPermissions(objectRecordsPermissions)
          : undefined,
      ],
    ),
  ),
});
