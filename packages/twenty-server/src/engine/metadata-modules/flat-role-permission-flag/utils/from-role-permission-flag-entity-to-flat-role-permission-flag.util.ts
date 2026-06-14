import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { type FlatRolePermissionFlag } from 'src/engine/metadata-modules/flat-role-permission-flag/types/flat-role-permission-flag.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';

export const fromRolePermissionFlagEntityToFlatRolePermissionFlag = ({
  entity: rolePermissionFlagEntity,
  applicationIdToUniversalIdentifierMap,
  permissionFlagIdToUniversalIdentifierMap,
  roleIdToUniversalIdentifierMap,
}: FromEntityToFlatEntityArgs<'rolePermissionFlag'>): FlatRolePermissionFlag => {
  const rolePermissionFlagEntityWithoutRelations = removePropertiesFromRecord(
    rolePermissionFlagEntity,
    getMetadataEntityRelationProperties('rolePermissionFlag'),
  );

  const applicationUniversalIdentifier =
    applicationIdToUniversalIdentifierMap.get(
      rolePermissionFlagEntity.applicationId,
    );

  if (!isDefined(applicationUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `Application with id ${rolePermissionFlagEntity.applicationId} not found for rolePermissionFlag ${rolePermissionFlagEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  const roleUniversalIdentifier = roleIdToUniversalIdentifierMap.get(
    rolePermissionFlagEntity.roleId,
  );

  if (!isDefined(roleUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `Role with id ${rolePermissionFlagEntity.roleId} not found for rolePermissionFlag ${rolePermissionFlagEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  const permissionFlagUniversalIdentifier =
    permissionFlagIdToUniversalIdentifierMap.get(
      rolePermissionFlagEntity.permissionFlagId,
    );

  if (!isDefined(permissionFlagUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `PermissionFlag with id ${rolePermissionFlagEntity.permissionFlagId} not found for rolePermissionFlag ${rolePermissionFlagEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  return {
    ...rolePermissionFlagEntityWithoutRelations,
    createdAt: rolePermissionFlagEntity.createdAt.toISOString(),
    updatedAt: rolePermissionFlagEntity.updatedAt.toISOString(),
    universalIdentifier:
      rolePermissionFlagEntityWithoutRelations.universalIdentifier,
    applicationUniversalIdentifier,
    permissionFlagUniversalIdentifier,
    roleUniversalIdentifier,
  };
};
