import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { type FlatPermissionFlagDefinition } from 'src/engine/metadata-modules/flat-permission-flag-definition/types/flat-permission-flag-definition.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';

export const fromPermissionFlagDefinitionEntityToFlatPermissionFlagDefinition =
  ({
    entity: permissionFlagDefinitionEntity,
    applicationIdToUniversalIdentifierMap,
  }: FromEntityToFlatEntityArgs<'permissionFlagDefinition'>): FlatPermissionFlagDefinition => {
    const entityWithoutRelations = removePropertiesFromRecord(
      permissionFlagDefinitionEntity,
      getMetadataEntityRelationProperties('permissionFlagDefinition'),
    );

    const applicationUniversalIdentifier =
      applicationIdToUniversalIdentifierMap.get(
        permissionFlagDefinitionEntity.applicationId,
      );

    if (!isDefined(applicationUniversalIdentifier)) {
      throw new FlatEntityMapsException(
        `Application with id ${permissionFlagDefinitionEntity.applicationId} not found for permissionFlagDefinition ${permissionFlagDefinitionEntity.id}`,
        FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
      );
    }

    return {
      ...entityWithoutRelations,
      createdAt: permissionFlagDefinitionEntity.createdAt.toISOString(),
      updatedAt: permissionFlagDefinitionEntity.updatedAt.toISOString(),
      universalIdentifier: entityWithoutRelations.universalIdentifier,
      applicationUniversalIdentifier,
    };
  };
