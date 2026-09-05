import { type PermissionFlagType } from 'twenty-shared/constants';
import {
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type UserWorkspacePermissions } from 'src/engine/metadata-modules/permissions/types/user-workspace-permissions';
import { type UserWorkspacePermissionsDto } from 'src/engine/metadata-modules/role/dtos/user-workspace-permissions.dto';

export const fromUserWorkspacePermissionsToUserWorkspacePermissionsDto = ({
  objectsPermissions: rawObjectsPermissions,
  permissionFlags: rawSettingsPermissions,
}: UserWorkspacePermissions): UserWorkspacePermissionsDto => {
  const objectPermissions = Object.entries(rawObjectsPermissions).map(
    ([objectMetadataId, permissions]) => ({
      objectMetadataId,
      canReadObjectRecords: permissions.canReadObjectRecords,
      canUpdateObjectRecords: permissions.canUpdateObjectRecords,
      canSoftDeleteObjectRecords: permissions.canSoftDeleteObjectRecords,
      canDestroyObjectRecords: permissions.canDestroyObjectRecords,
      restrictedFields: permissions.restrictedFields,
      rowLevelPermissionPredicates:
        permissions.rowLevelPermissionPredicates.filter(
          (
            predicate,
          ): predicate is RowLevelPermissionPredicate & { roleId: string } =>
            isDefined(predicate.roleId),
        ),
      rowLevelPermissionPredicateGroups:
        permissions.rowLevelPermissionPredicateGroups.filter(
          (
            predicateGroup,
          ): predicateGroup is RowLevelPermissionPredicateGroup & {
            roleId: string;
          } => isDefined(predicateGroup.roleId),
        ),
    }),
  );

  const objectsPermissions = objectPermissions;

  const permissionFlags = (
    Object.keys(rawSettingsPermissions) as PermissionFlagType[]
  ).filter((feature) => rawSettingsPermissions[feature] === true);

  return {
    objectPermissions,
    objectsPermissions,
    permissionFlags,
  };
};
