import { type PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { type UserWorkspacePermissions } from 'src/engine/permissions/types/user-workspace-permissions.type';
import { type UserWorkspacePermissionsDto } from 'src/engine/metadata-modules/role/dtos/user-workspace-permissions.dto';
import { type ObjectPermissionDTO } from 'src/engine/metadata-modules/object-permission/dtos/object-permission.dto';
import { canReachSomeRecords } from 'src/engine/permissions/role/utils/can-reach-some-records.util';
import { type ObjectRecordsPermissionsDTO } from 'src/engine/permissions/dtos/object-records-permissions.dto';

export const fromUserWorkspacePermissionsToUserWorkspacePermissionsDto = ({
  recordsPermissions,
  permissionFlags: rawSettingsPermissions,
}: UserWorkspacePermissions): UserWorkspacePermissionsDto => {
  const objectRecordsPermissions: ObjectRecordsPermissionsDTO[] = [];
  const objectPermissions: ObjectPermissionDTO[] = [];

  for (const [objectMetadataId, permissions] of Object.entries(
    recordsPermissions.objects,
  )) {
    if (!isDefined(permissions)) {
      continue;
    }

    objectRecordsPermissions.push({
      objectMetadataId,
      canReadAllRecords: permissions.canReadAllRecords,
      canUpdateAllRecords: permissions.canUpdateAllRecords,
      canSoftDeleteAllRecords: permissions.canSoftDeleteAllRecords,
      canDestroyAllRecords: permissions.canDestroyAllRecords,
      restrictedFields: permissions.restrictedFields,
      rowLevelRecordsPermissions: permissions.rowLevelRecordsPermissions,
    });

    objectPermissions.push({
      objectMetadataId,
      canReadObjectRecords: canReachSomeRecords({
        objectRecordsPermissions: permissions,
        operationType: 'select',
      }),
      canUpdateObjectRecords: canReachSomeRecords({
        objectRecordsPermissions: permissions,
        operationType: 'update',
      }),
      canSoftDeleteObjectRecords: canReachSomeRecords({
        objectRecordsPermissions: permissions,
        operationType: 'soft-delete',
      }),
      canDestroyObjectRecords: canReachSomeRecords({
        objectRecordsPermissions: permissions,
        operationType: 'delete',
      }),
      restrictedFields: permissions.restrictedFields,
      rowLevelPermissionPredicates:
        permissions.rowLevelRecordsPermissions?.predicates ?? [],
      rowLevelPermissionPredicateGroups:
        permissions.rowLevelRecordsPermissions?.predicateGroups ?? [],
    });
  }

  const permissionFlags = (
    Object.keys(rawSettingsPermissions) as PermissionFlagType[]
  ).filter((feature) => rawSettingsPermissions[feature] === true);

  return {
    objectRecordsPermissions,
    objectPermissions,
    objectsPermissions: objectPermissions,
    permissionFlags,
  };
};
