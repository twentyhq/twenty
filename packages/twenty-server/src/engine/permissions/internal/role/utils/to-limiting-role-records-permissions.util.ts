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
        canCreateAllRecords:
          objectRecordsPermissions.canCreateAllRecords ||
          rowLevelRecordsPermissions.some(
            ({ canCreateRecords }) => canCreateRecords,
          ),
        canReadAllRecords:
          objectRecordsPermissions.canReadAllRecords ||
          rowLevelRecordsPermissions.some(
            ({ canReadRecords }) => canReadRecords,
          ),
        canUpdateAllRecords:
          objectRecordsPermissions.canUpdateAllRecords ||
          rowLevelRecordsPermissions.some(
            ({ canUpdateRecords }) => canUpdateRecords,
          ),
        canSoftDeleteAllRecords:
          objectRecordsPermissions.canSoftDeleteAllRecords ||
          rowLevelRecordsPermissions.some(
            ({ canSoftDeleteRecords }) => canSoftDeleteRecords,
          ),
        canDestroyAllRecords:
          objectRecordsPermissions.canDestroyAllRecords ||
          rowLevelRecordsPermissions.some(
            ({ canDestroyRecords }) => canDestroyRecords,
          ),
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
