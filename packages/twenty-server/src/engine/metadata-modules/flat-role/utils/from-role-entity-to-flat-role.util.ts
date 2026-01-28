import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';

export const fromRoleEntityToFlatRole = ({
  entity: roleEntity,
  applicationIdToUniversalIdentifierMap,
}: FromEntityToFlatEntityArgs<'role'>): FlatRole => {
  const applicationUniversalIdentifier =
    applicationIdToUniversalIdentifierMap.get(roleEntity.applicationId);

  if (!isDefined(applicationUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `Application with id ${roleEntity.applicationId} not found for role ${roleEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  return {
    id: roleEntity.id,
    standardId: roleEntity.standardId,
    label: roleEntity.label,
    description: roleEntity.description,
    icon: roleEntity.icon,
    isEditable: roleEntity.isEditable,
    canUpdateAllSettings: roleEntity.canUpdateAllSettings,
    canAccessAllTools: roleEntity.canAccessAllTools,
    canReadAllObjectRecords: roleEntity.canReadAllObjectRecords,
    canUpdateAllObjectRecords: roleEntity.canUpdateAllObjectRecords,
    canSoftDeleteAllObjectRecords: roleEntity.canSoftDeleteAllObjectRecords,
    canDestroyAllObjectRecords: roleEntity.canDestroyAllObjectRecords,
    canBeAssignedToUsers: roleEntity.canBeAssignedToUsers,
    canBeAssignedToAgents: roleEntity.canBeAssignedToAgents,
    canBeAssignedToApiKeys: roleEntity.canBeAssignedToApiKeys,
    workspaceId: roleEntity.workspaceId,
    createdAt: roleEntity.createdAt.toISOString(),
    updatedAt: roleEntity.updatedAt.toISOString(),
    universalIdentifier: roleEntity.universalIdentifier,
    applicationId: roleEntity.applicationId,
    roleTargetIds: roleEntity.roleTargets.map(({ id }) => id),
    objectPermissionIds: roleEntity.objectPermissions.map(({ id }) => id),
    permissionFlagIds: roleEntity.permissionFlags.map(({ id }) => id),
    fieldPermissionIds: roleEntity.fieldPermissions.map(({ id }) => id),
    rowLevelPermissionPredicateIds: roleEntity.rowLevelPermissionPredicates.map(
      ({ id }) => id,
    ),
    rowLevelPermissionPredicateGroupIds:
      roleEntity.rowLevelPermissionPredicateGroups.map(({ id }) => id),
    __universal: {
      universalIdentifier: roleEntity.universalIdentifier,
      applicationUniversalIdentifier,
      roleTargetUniversalIdentifiers: roleEntity.roleTargets.map(
        ({ universalIdentifier }) => universalIdentifier,
      ),
      rowLevelPermissionPredicateUniversalIdentifiers:
        roleEntity.rowLevelPermissionPredicates.map(
          ({ universalIdentifier }) => universalIdentifier,
        ),
      rowLevelPermissionPredicateGroupUniversalIdentifiers:
        roleEntity.rowLevelPermissionPredicateGroups.map(
          ({ universalIdentifier }) => universalIdentifier,
        ),
    },
  };
};
