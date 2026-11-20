/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { isFieldUnreadableByRole } from 'src/engine/permissions/internal/related-record-path/utils/is-field-unreadable-by-role.util';
import { isFieldUnreadableByRule } from 'src/engine/permissions/internal/related-record-path/utils/is-field-unreadable-by-rule.util';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';

export const omitPermissionsUnableToReadField = <
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

        if (!isDefined(objectRecordsPermissions)) {
          return [roleId, roleRecordsPermissions];
        }

        return [
          roleId,
          {
            ...roleRecordsPermissions,
            objects: {
              ...roleRecordsPermissions.objects,
              [objectMetadataId]: isFieldUnreadableByRole({
                roleRecordsPermissions,
                objectMetadataId,
                fieldMetadataId,
              })
                ? {
                    ...objectRecordsPermissions,
                    canReadAllRecords: false,
                    canUpdateAllRecords: false,
                    canSoftDeleteAllRecords: false,
                    canDestroyAllRecords: false,
                    rowLevelRecordsPermissions: [],
                  }
                : {
                    ...objectRecordsPermissions,
                    rowLevelRecordsPermissions: (
                      objectRecordsPermissions.rowLevelRecordsPermissions ?? []
                    ).filter(
                      (rowLevelRecordsPermissions) =>
                        !isFieldUnreadableByRule({
                          rowLevelRecordsPermissions,
                          fieldMetadataId,
                        }),
                    ),
                  },
            },
          },
        ];
      },
    ),
  ),
});
