/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { canRelatedRecordPathExtendAccess } from 'src/engine/permissions/internal/related-record-path/utils/can-related-record-path-extend-access.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

export const markObjectsReadableThroughRelatedRecordPaths = ({
  recordsPermissions,
  metadataMaps,
}: {
  recordsPermissions: RoleRecordsPermissions;
  metadataMaps: PermissionsMetadataMaps;
}): RoleRecordsPermissions => ({
  ...recordsPermissions,
  objects: Object.fromEntries(
    Object.entries(recordsPermissions.objects).map(
      ([objectMetadataId, objectRecordsPermissions]) => {
        const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: objectMetadataId,
          flatEntityMaps: metadataMaps.flatObjectMetadataMaps,
        });

        if (
          !isDefined(objectRecordsPermissions) ||
          !isDefined(flatObjectMetadata) ||
          !canRelatedRecordPathExtendAccess({
            metadataMaps,
            flatObjectMetadata,
            operationType: 'read',
          })
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
