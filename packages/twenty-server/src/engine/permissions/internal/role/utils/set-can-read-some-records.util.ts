/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

export const setCanReadSomeRecords = ({
  recordsPermissions,
  readableObjectMetadataIds,
}: {
  recordsPermissions: RoleRecordsPermissions;
  readableObjectMetadataIds: Set<string>;
}): RoleRecordsPermissions => ({
  ...recordsPermissions,
  objects: Object.fromEntries(
    Object.entries(recordsPermissions.objects).map(
      ([objectMetadataId, objectRecordsPermissions]) => [
        objectMetadataId,
        isDefined(objectRecordsPermissions)
          ? {
              ...objectRecordsPermissions,
              canReadSomeRecords:
                readableObjectMetadataIds.has(objectMetadataId),
            }
          : objectRecordsPermissions,
      ],
    ),
  ),
});
