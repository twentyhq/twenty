import { type PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { type UserWorkspacePermissions } from 'src/engine/permissions/types/user-workspace-permissions.type';
import { type UserWorkspacePermissionsDto } from 'src/engine/metadata-modules/role/dtos/user-workspace-permissions.dto';
import { canReachSomeRecords } from 'src/engine/permissions/role/utils/can-reach-some-records.util';

export const fromUserWorkspacePermissionsToUserWorkspacePermissionsDto = ({
  recordsPermissions,
  permissionFlags: rawSettingsPermissions,
}: UserWorkspacePermissions): UserWorkspacePermissionsDto => {
  const objectPermissions: UserWorkspacePermissionsDto['objectPermissions'] =
    [];

  for (const [objectMetadataId, objectRecordsPermissions] of Object.entries(
    recordsPermissions.objects,
  )) {
    if (!isDefined(objectRecordsPermissions)) {
      continue;
    }

    objectPermissions.push({
      objectMetadataId,
      canReadObjectRecords: canReachSomeRecords({
        objectRecordsPermissions,
        operationType: 'select',
      }),
      canUpdateObjectRecords: canReachSomeRecords({
        objectRecordsPermissions,
        operationType: 'update',
      }),
      canSoftDeleteObjectRecords: canReachSomeRecords({
        objectRecordsPermissions,
        operationType: 'soft-delete',
      }),
      canDestroyObjectRecords: canReachSomeRecords({
        objectRecordsPermissions,
        operationType: 'delete',
      }),
      restrictedFields: objectRecordsPermissions.restrictedFields,
      rowLevelPermissionPredicates:
        objectRecordsPermissions.rowLevelRecordsPermissions?.predicates ?? [],
      rowLevelPermissionPredicateGroups:
        objectRecordsPermissions.rowLevelRecordsPermissions?.predicateGroups ??
        [],
    });
  }

  const permissionFlags = (
    Object.keys(rawSettingsPermissions) as PermissionFlagType[]
  ).filter((feature) => rawSettingsPermissions[feature] === true);

  return {
    objectPermissions,
    objectsPermissions: objectPermissions,
    permissionFlags,
  };
};
