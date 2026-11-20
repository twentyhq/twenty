/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';

export const omitRolesHidingField = <
  TMetadataMaps extends Pick<PermissionsMetadataMaps, 'rolesPermissions'>,
>({
  metadataMaps,
  objectMetadataId,
  fieldMetadataId,
}: {
  metadataMaps: TMetadataMaps;
  objectMetadataId: string;
  fieldMetadataId: string;
}): TMetadataMaps => ({
  ...metadataMaps,
  rolesPermissions: Object.fromEntries(
    Object.entries(metadataMaps.rolesPermissions).map(
      ([roleId, roleRecordsPermissions]) => {
        const objectRecordsPermissions =
          roleRecordsPermissions.objects[objectMetadataId];

        if (
          !isDefined(objectRecordsPermissions) ||
          !(objectRecordsPermissions.unreadableFields ?? []).includes(
            fieldMetadataId,
          )
        ) {
          return [roleId, roleRecordsPermissions];
        }

        return [
          roleId,
          {
            ...roleRecordsPermissions,
            objects: {
              ...roleRecordsPermissions.objects,
              [objectMetadataId]: {
                ...objectRecordsPermissions,
                canReadAllRecords: false,
                canUpdateAllRecords: false,
                canSoftDeleteAllRecords: false,
                canDestroyAllRecords: false,
                rowLevelRecordsPermissions: [],
              },
            },
          },
        ];
      },
    ),
  ),
});
