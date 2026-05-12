import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { type FlatPermissionFlagGrant } from 'src/engine/metadata-modules/flat-permission-flag-grant/types/flat-permission-flag-grant.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';

export const fromPermissionFlagGrantEntityToFlatPermissionFlagGrant = ({
  entity: permissionFlagGrantEntity,
  applicationIdToUniversalIdentifierMap,
  roleIdToUniversalIdentifierMap,
}: FromEntityToFlatEntityArgs<'permissionFlagGrant'>): FlatPermissionFlagGrant => {
  const permissionFlagGrantEntityWithoutRelations = removePropertiesFromRecord(
    permissionFlagGrantEntity,
    getMetadataEntityRelationProperties('permissionFlagGrant'),
  );

  const applicationUniversalIdentifier =
    applicationIdToUniversalIdentifierMap.get(
      permissionFlagGrantEntity.applicationId,
    );

  if (!isDefined(applicationUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `Application with id ${permissionFlagGrantEntity.applicationId} not found for permissionFlagGrant ${permissionFlagGrantEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  const roleUniversalIdentifier = roleIdToUniversalIdentifierMap.get(
    permissionFlagGrantEntity.roleId,
  );

  if (!isDefined(roleUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `Role with id ${permissionFlagGrantEntity.roleId} not found for permissionFlagGrant ${permissionFlagGrantEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  return {
    ...permissionFlagGrantEntityWithoutRelations,
    createdAt: permissionFlagGrantEntity.createdAt.toISOString(),
    updatedAt: permissionFlagGrantEntity.updatedAt.toISOString(),
    universalIdentifier:
      permissionFlagGrantEntityWithoutRelations.universalIdentifier,
    applicationUniversalIdentifier,
    roleUniversalIdentifier,
  };
};
