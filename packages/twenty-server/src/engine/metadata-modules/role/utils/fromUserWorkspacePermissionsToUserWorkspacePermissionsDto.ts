import { type PermissionFlagType } from 'twenty-shared/constants';
import { type ObjectRecordsPermissions } from 'twenty-shared/types';
import { canReachSomeRecords, isDefined } from 'twenty-shared/utils';

import { type ObjectPermissionDTO } from 'src/engine/metadata-modules/object-permission/dtos/object-permission.dto';
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

const fromObjectRecordsPermissionsToLegacyObjectPermission = ({
  objectMetadataId,
  objectRecordsPermissions,
}: {
  objectMetadataId: string;
  objectRecordsPermissions: ObjectRecordsPermissions;
}): ObjectPermissionDTO => ({
  objectMetadataId,
  canReadObjectRecords: canReachSomeRecords({
    objectRecordsPermissions,
    operationType: 'read',
  }),
  canUpdateObjectRecords: canReachSomeRecords({
    objectRecordsPermissions,
    operationType: 'update',
  }),
  canSoftDeleteObjectRecords: canReachSomeRecords({
    objectRecordsPermissions,
    operationType: 'softDelete',
  }),
  canDestroyObjectRecords: canReachSomeRecords({
    objectRecordsPermissions,
    operationType: 'destroy',
  }),
  ...buildFieldLists(objectRecordsPermissions),
  rowLevelPermissionPredicates:
    objectRecordsPermissions.rowLevelRecordsPermissions?.predicates ?? [],
  rowLevelPermissionPredicateGroups:
    objectRecordsPermissions.rowLevelRecordsPermissions?.predicateGroups ?? [],
});

export const fromUserWorkspacePermissionsToUserWorkspacePermissionsDto = ({
  recordsPermissions,
  permissionFlags: rawSettingsPermissions,
}: UserWorkspacePermissions): UserWorkspacePermissionsDto => {
  const objectRecordsPermissions: ObjectRecordsPermissionsDTO[] = [];
  const legacyObjectPermissions: ObjectPermissionDTO[] = [];

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
    legacyObjectPermissions.push(
      fromObjectRecordsPermissionsToLegacyObjectPermission({
        objectMetadataId,
        objectRecordsPermissions: permissions,
      }),
    );
  }

  const permissionFlags = (
    Object.keys(rawSettingsPermissions) as PermissionFlagType[]
  ).filter((feature) => rawSettingsPermissions[feature] === true);

  return {
    objectRecordsPermissions,
    objectPermissions: legacyObjectPermissions,
    objectsPermissions: legacyObjectPermissions,
    permissionFlags,
  };
};
