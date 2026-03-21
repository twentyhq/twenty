import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { type FlatObjectPermission } from 'src/engine/metadata-modules/flat-object-permission/types/flat-object-permission.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';

export const fromObjectPermissionEntityToFlatObjectPermission = ({
  entity: objectPermissionEntity,
  applicationIdToUniversalIdentifierMap,
  roleIdToUniversalIdentifierMap,
  objectMetadataIdToUniversalIdentifierMap,
}: FromEntityToFlatEntityArgs<'objectPermission'>): FlatObjectPermission => {
  const objectPermissionEntityWithoutRelations = removePropertiesFromRecord(
    objectPermissionEntity,
    getMetadataEntityRelationProperties('objectPermission'),
  );

  const applicationUniversalIdentifier =
    applicationIdToUniversalIdentifierMap.get(
      objectPermissionEntity.applicationId,
    );

  if (!isDefined(applicationUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `Application with id ${objectPermissionEntity.applicationId} not found for objectPermission ${objectPermissionEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  const roleUniversalIdentifier = roleIdToUniversalIdentifierMap.get(
    objectPermissionEntity.roleId,
  );

  if (!isDefined(roleUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `Role with id ${objectPermissionEntity.roleId} not found for objectPermission ${objectPermissionEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  const objectMetadataUniversalIdentifier =
    objectMetadataIdToUniversalIdentifierMap.get(
      objectPermissionEntity.objectMetadataId,
    );

  if (!isDefined(objectMetadataUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `ObjectMetadata with id ${objectPermissionEntity.objectMetadataId} not found for objectPermission ${objectPermissionEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  return {
    ...objectPermissionEntityWithoutRelations,
    createdAt: objectPermissionEntity.createdAt.toISOString(),
    updatedAt: objectPermissionEntity.updatedAt.toISOString(),
    universalIdentifier:
      objectPermissionEntityWithoutRelations.universalIdentifier,
    applicationUniversalIdentifier,
    roleUniversalIdentifier,
    objectMetadataUniversalIdentifier,
  };
};
