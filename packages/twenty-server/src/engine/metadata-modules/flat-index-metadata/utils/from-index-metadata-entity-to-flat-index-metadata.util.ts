import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';

export const fromIndexMetadataEntityToFlatIndexMetadata = ({
  entity: indexMetadataEntity,
  applicationIdToUniversalIdentifierMap,
  objectMetadataIdToUniversalIdentifierMap,
  fieldMetadataIdToUniversalIdentifierMap,
}: FromEntityToFlatEntityArgs<'index'> & {
  fieldMetadataIdToUniversalIdentifierMap: Map<string, string>;
}): FlatIndexMetadata => {
  const applicationUniversalIdentifier =
    applicationIdToUniversalIdentifierMap.get(
      indexMetadataEntity.applicationId,
    );

  if (!isDefined(applicationUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `Application with id ${indexMetadataEntity.applicationId} not found for index ${indexMetadataEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  const objectMetadataUniversalIdentifier =
    objectMetadataIdToUniversalIdentifierMap.get(
      indexMetadataEntity.objectMetadataId,
    );

  if (!isDefined(objectMetadataUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `ObjectMetadata with id ${indexMetadataEntity.objectMetadataId} not found for index ${indexMetadataEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  const indexMetadataEntityWithoutRelations = removePropertiesFromRecord(
    indexMetadataEntity,
    getMetadataEntityRelationProperties('index'),
  );

  return {
    ...indexMetadataEntityWithoutRelations,
    createdAt: indexMetadataEntity.createdAt.toISOString(),
    updatedAt: indexMetadataEntity.updatedAt.toISOString(),
    universalIdentifier:
      indexMetadataEntityWithoutRelations.universalIdentifier,
    flatIndexFieldMetadatas: indexMetadataEntity.indexFieldMetadatas.map(
      (indexFieldMetadata) => ({
        ...removePropertiesFromRecord(indexFieldMetadata, [
          'indexMetadata',
          'fieldMetadata',
        ]),
        createdAt: indexFieldMetadata.createdAt.toISOString(),
        updatedAt: indexFieldMetadata.updatedAt.toISOString(),
      }),
    ),
    universalFlatIndexFieldMetadatas:
      indexMetadataEntity.indexFieldMetadatas.map((indexFieldMetadata) => {
        const fieldMetadataUniversalIdentifier =
          fieldMetadataIdToUniversalIdentifierMap.get(
            indexFieldMetadata.fieldMetadataId,
          );

        if (!isDefined(fieldMetadataUniversalIdentifier)) {
          throw new FlatEntityMapsException(
            `FieldMetadata with id ${indexFieldMetadata.fieldMetadataId} not found for index field metadata ${indexFieldMetadata.id}`,
            FlatEntityMapsExceptionCode.RELATION_UNIVERSAL_IDENTIFIER_NOT_FOUND,
          );
        }

        return {
          order: indexFieldMetadata.order,
          createdAt: indexFieldMetadata.createdAt.toISOString(),
          updatedAt: indexFieldMetadata.updatedAt.toISOString(),
          indexMetadataUniversalIdentifier:
            indexMetadataEntity.universalIdentifier,
          fieldMetadataUniversalIdentifier,
        };
      }),
    applicationUniversalIdentifier,
    objectMetadataUniversalIdentifier,
  };
};
