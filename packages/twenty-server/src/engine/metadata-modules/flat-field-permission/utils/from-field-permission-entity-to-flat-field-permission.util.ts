import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { type FlatFieldPermission } from 'src/engine/metadata-modules/flat-field-permission/types/flat-field-permission.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';

export const fromFieldPermissionEntityToFlatFieldPermission = ({
  entity: fieldPermissionEntity,
  applicationIdToUniversalIdentifierMap,
  roleIdToUniversalIdentifierMap,
  objectMetadataIdToUniversalIdentifierMap,
  fieldMetadataIdToUniversalIdentifierMap,
}: FromEntityToFlatEntityArgs<'fieldPermission'>): FlatFieldPermission => {
  const fieldPermissionEntityWithoutRelations = removePropertiesFromRecord(
    fieldPermissionEntity,
    getMetadataEntityRelationProperties('fieldPermission'),
  );

  const applicationUniversalIdentifier =
    applicationIdToUniversalIdentifierMap.get(
      fieldPermissionEntity.applicationId,
    );

  if (!isDefined(applicationUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `Application with id ${fieldPermissionEntity.applicationId} not found for fieldPermission ${fieldPermissionEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  const roleUniversalIdentifier = roleIdToUniversalIdentifierMap.get(
    fieldPermissionEntity.roleId,
  );

  if (!isDefined(roleUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `Role with id ${fieldPermissionEntity.roleId} not found for fieldPermission ${fieldPermissionEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  const objectMetadataUniversalIdentifier =
    objectMetadataIdToUniversalIdentifierMap.get(
      fieldPermissionEntity.objectMetadataId,
    );

  if (!isDefined(objectMetadataUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `ObjectMetadata with id ${fieldPermissionEntity.objectMetadataId} not found for fieldPermission ${fieldPermissionEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  const fieldMetadataUniversalIdentifier =
    fieldMetadataIdToUniversalIdentifierMap.get(
      fieldPermissionEntity.fieldMetadataId,
    );

  if (!isDefined(fieldMetadataUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `FieldMetadata with id ${fieldPermissionEntity.fieldMetadataId} not found for fieldPermission ${fieldPermissionEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  return {
    ...fieldPermissionEntityWithoutRelations,
    createdAt: fieldPermissionEntity.createdAt.toISOString(),
    updatedAt: fieldPermissionEntity.updatedAt.toISOString(),
    universalIdentifier:
      fieldPermissionEntityWithoutRelations.universalIdentifier,
    applicationUniversalIdentifier,
    roleUniversalIdentifier,
    objectMetadataUniversalIdentifier,
    fieldMetadataUniversalIdentifier,
  };
};
