import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';

type FromObjectMetadataEntityToFlatObjectMetadataArgs =
  FromEntityToFlatEntityArgs<'objectMetadata'> & {
    fieldMetadataIdToUniversalIdentifierMap: Map<string, string>;
  };

export const fromObjectMetadataEntityToFlatObjectMetadata = ({
  entity: objectMetadataEntity,
  applicationIdToUniversalIdentifierMap,
  fieldMetadataIdToUniversalIdentifierMap,
}: FromObjectMetadataEntityToFlatObjectMetadataArgs): FlatObjectMetadata => {
  const objectMetadataEntityWithoutRelations = removePropertiesFromRecord(
    objectMetadataEntity,
    getMetadataEntityRelationProperties('objectMetadata'),
  );

  const applicationUniversalIdentifier =
    applicationIdToUniversalIdentifierMap.get(
      objectMetadataEntity.applicationId,
    );

  if (!isDefined(applicationUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `Application with id ${objectMetadataEntity.applicationId} not found when building flat object metadata for object ${objectMetadataEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  let labelIdentifierFieldMetadataUniversalIdentifier: string | null = null;

  if (isDefined(objectMetadataEntity.labelIdentifierFieldMetadataId)) {
    labelIdentifierFieldMetadataUniversalIdentifier =
      fieldMetadataIdToUniversalIdentifierMap.get(
        objectMetadataEntity.labelIdentifierFieldMetadataId,
      ) ?? null;

    // TODO uncomment once https://github.com/twentyhq/core-team-issues/issues/2172 has been resolved
    // if (!isDefined(labelIdentifierFieldMetadataUniversalIdentifier)) {
    //   throw new FlatEntityMapsException(
    //     `Label identifier field metadata with id ${objectMetadataEntity.labelIdentifierFieldMetadataId} not found when building flat object metadata for object ${objectMetadataEntity.id}`,
    //     FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    //   );
    // }
  }

  let imageIdentifierFieldMetadataUniversalIdentifier: string | null = null;

  if (isDefined(objectMetadataEntity.imageIdentifierFieldMetadataId)) {
    imageIdentifierFieldMetadataUniversalIdentifier =
      fieldMetadataIdToUniversalIdentifierMap.get(
        objectMetadataEntity.imageIdentifierFieldMetadataId,
      ) ?? null;

    // TODO uncomment once https://github.com/twentyhq/core-team-issues/issues/2172 has been resolved
    // if (!isDefined(imageIdentifierFieldMetadataUniversalIdentifier)) {
    //   throw new FlatEntityMapsException(
    //     `Image identifier field metadata with id ${objectMetadataEntity.imageIdentifierFieldMetadataId} not found when building flat object metadata for object ${objectMetadataEntity.id}`,
    //     FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    //   );
    // }
  }

  return {
    ...objectMetadataEntityWithoutRelations,
    universalIdentifier:
      objectMetadataEntityWithoutRelations.universalIdentifier,
    createdAt: objectMetadataEntity.createdAt.toISOString(),
    updatedAt: objectMetadataEntity.updatedAt.toISOString(),
    viewIds: objectMetadataEntity.views.map(({ id }) => id),
    indexMetadataIds: objectMetadataEntity.indexMetadatas.map(({ id }) => id),
    fieldIds: objectMetadataEntity.fields.map(({ id }) => id),
    applicationUniversalIdentifier,
    labelIdentifierFieldMetadataUniversalIdentifier,
    imageIdentifierFieldMetadataUniversalIdentifier,
    fieldUniversalIdentifiers: objectMetadataEntity.fields.map(
      ({ universalIdentifier }) => universalIdentifier,
    ),
    indexMetadataUniversalIdentifiers: objectMetadataEntity.indexMetadatas.map(
      ({ universalIdentifier }) => universalIdentifier,
    ),
    viewUniversalIdentifiers: objectMetadataEntity.views.map(
      ({ universalIdentifier }) => universalIdentifier,
    ),
  };
};
