/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { isFieldUnreadableByRole } from 'src/engine/permissions/internal/related-record-path/utils/is-field-unreadable-by-role.util';
import { isFieldUnreadableByRule } from 'src/engine/permissions/internal/related-record-path/utils/is-field-unreadable-by-rule.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

const omitObjectRecordsIfFieldUnreadable = ({
  roleRecordsPermissions,
  objectMetadataId,
  fieldMetadataId,
}: {
  roleRecordsPermissions: RoleRecordsPermissions;
  objectMetadataId: string;
  fieldMetadataId: string;
}): RoleRecordsPermissions => {
  const objectRecordsPermissions =
    roleRecordsPermissions.objects[objectMetadataId];

  if (!isDefined(objectRecordsPermissions)) {
    return roleRecordsPermissions;
  }

  if (
    !isFieldUnreadableByRole({
      roleRecordsPermissions,
      objectMetadataId,
      fieldMetadataId,
    })
  ) {
    return {
      ...roleRecordsPermissions,
      objects: {
        ...roleRecordsPermissions.objects,
        [objectMetadataId]: {
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
    };
  }

  return {
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
  };
};

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
      ([roleId, roleRecordsPermissions]) => [
        roleId,
        omitObjectRecordsIfFieldUnreadable({
          roleRecordsPermissions,
          objectMetadataId,
          fieldMetadataId,
        }),
      ],
    ),
  ),
});
