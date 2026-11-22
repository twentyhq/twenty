/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

export const markObjectsReadableThroughRelatedRecordPaths = ({
  recordsPermissions,
  objectMetadataIdsReadableThroughRelatedRecordPaths,
}: {
  recordsPermissions: RoleRecordsPermissions;
  objectMetadataIdsReadableThroughRelatedRecordPaths: Set<string>;
}): RoleRecordsPermissions => ({
  ...recordsPermissions,
  objects: Object.fromEntries(
    Object.entries(recordsPermissions.objects).map(
      ([objectMetadataId, objectRecordsPermissions]) => {
        if (
          !isDefined(objectRecordsPermissions) ||
          !objectMetadataIdsReadableThroughRelatedRecordPaths.has(
            objectMetadataId,
          )
        ) {
          return [objectMetadataId, objectRecordsPermissions];
        }

        return [
          objectMetadataId,
          {
            ...objectRecordsPermissions,
            canReadRecordsThroughRelatedRecordPaths: true,
          },
        ];
      },
    ),
  ),
});
