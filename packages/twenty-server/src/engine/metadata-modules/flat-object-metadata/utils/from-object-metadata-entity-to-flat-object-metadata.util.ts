import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type EntityManyToOneIdByUniversalIdentifierMaps } from 'src/engine/workspace-cache/types/entity-many-to-one-id-by-universal-identifier-maps.type';
import { type EntityWithRegroupedOneToManyRelations } from 'src/engine/workspace-cache/types/entity-with-regrouped-one-to-many-relations.type';

type FromObjectMetadataEntityToFlatObjectMetadataArgs = {
  objectMetadataEntity: EntityWithRegroupedOneToManyRelations<ObjectMetadataEntity>;
  fieldIdToUniversalIdentifierMap: Map<string, string>;
} & EntityManyToOneIdByUniversalIdentifierMaps<'objectMetadata'>;

export const fromObjectMetadataEntityToFlatObjectMetadata = ({
  objectMetadataEntity,
  applicationIdToUniversalIdentifierMap,
  fieldIdToUniversalIdentifierMap,
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
      fieldIdToUniversalIdentifierMap.get(
        objectMetadataEntity.labelIdentifierFieldMetadataId,
      ) ?? null;

    if (!isDefined(labelIdentifierFieldMetadataUniversalIdentifier)) {
      throw new FlatEntityMapsException(
        `Label identifier field metadata with id ${objectMetadataEntity.labelIdentifierFieldMetadataId} not found when building flat object metadata for object ${objectMetadataEntity.id}`,
        FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
      );
    }
  }

  let imageIdentifierFieldMetadataUniversalIdentifier: string | null = null;

  if (isDefined(objectMetadataEntity.imageIdentifierFieldMetadataId)) {
    imageIdentifierFieldMetadataUniversalIdentifier =
      fieldIdToUniversalIdentifierMap.get(
        objectMetadataEntity.imageIdentifierFieldMetadataId,
      ) ?? null;

    if (!isDefined(imageIdentifierFieldMetadataUniversalIdentifier)) {
      throw new FlatEntityMapsException(
        `Image identifier field metadata with id ${objectMetadataEntity.imageIdentifierFieldMetadataId} not found when building flat object metadata for object ${objectMetadataEntity.id}`,
        FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
      );
    }
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
    __universal: {
      universalIdentifier:
        objectMetadataEntityWithoutRelations.universalIdentifier,
      applicationUniversalIdentifier,
      labelIdentifierFieldMetadataUniversalIdentifier,
      imageIdentifierFieldMetadataUniversalIdentifier,
      fieldUniversalIdentifiers: objectMetadataEntity.fields.map(
        ({ universalIdentifier }) => universalIdentifier,
      ),
      indexMetadataUniversalIdentifiers:
        objectMetadataEntity.indexMetadatas.map(
          ({ universalIdentifier }) => universalIdentifier,
        ),
      viewUniversalIdentifiers: objectMetadataEntity.views.map(
        ({ universalIdentifier }) => universalIdentifier,
      ),
      standardOverrides: objectMetadataEntityWithoutRelations.standardOverrides,
      duplicateCriteria: objectMetadataEntityWithoutRelations.duplicateCriteria,
    },
  };
};
