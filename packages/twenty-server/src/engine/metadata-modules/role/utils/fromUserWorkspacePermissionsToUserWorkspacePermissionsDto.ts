import { type PermissionFlagType } from 'twenty-shared/constants';
import { type ObjectRecordsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { buildDeprecatedRestrictedFields } from 'src/engine/metadata-modules/role/utils/build-deprecated-restricted-fields.util';
import { type UserWorkspacePermissions } from 'src/engine/permissions/types/user-workspace-permissions.type';
import { type UserWorkspacePermissionsDto } from 'src/engine/metadata-modules/role/dtos/user-workspace-permissions.dto';
import { type ObjectRecordsPermissionsDTO } from 'src/engine/permissions/dtos/object-records-permissions.dto';

// Cached role permissions keep their old shape until the upgrade recomputes them
const buildFieldLists = ({
  unreadableFields,
  uneditableFields,
}: Pick<ObjectRecordsPermissions, 'unreadableFields' | 'uneditableFields'>) => {
  const fieldLists = {
    unreadableFields: unreadableFields ?? [],
    uneditableFields: uneditableFields ?? [],
  };

  return {
    ...fieldLists,
    restrictedFields: buildDeprecatedRestrictedFields(fieldLists),
  };
};

export const fromUserWorkspacePermissionsToUserWorkspacePermissionsDto = ({
  recordsPermissions,
  permissionFlags: rawSettingsPermissions,
}: UserWorkspacePermissions): UserWorkspacePermissionsDto => {
  const objectRecordsPermissions: ObjectRecordsPermissionsDTO[] = [];

  for (const [objectMetadataId, permissions] of Object.entries(
    recordsPermissions.objects,
  )) {
    if (!isDefined(permissions)) {
      continue;
    }

    objectRecordsPermissions.push({
      objectMetadataId,
      canCreateAllRecords: permissions.canCreateAllRecords,
      canReadAllRecords: permissions.canReadAllRecords,
      canUpdateAllRecords: permissions.canUpdateAllRecords,
      canSoftDeleteAllRecords: permissions.canSoftDeleteAllRecords,
      canDestroyAllRecords: permissions.canDestroyAllRecords,
      ...buildFieldLists(permissions),
      rowLevelRecordsPermissions: permissions.rowLevelRecordsPermissions,
    });
  }

  const permissionFlags = (
    Object.keys(rawSettingsPermissions) as PermissionFlagType[]
  ).filter((feature) => rawSettingsPermissions[feature] === true);

  return {
    objectRecordsPermissions,
    permissionFlags,
  };
};
