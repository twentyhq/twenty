import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';

export const fromIndexMetadataEntityToFlatIndexMetadata = (
  indexMetadataEntity: IndexMetadataEntity,
): FlatIndexMetadata => {
  const indexMetadataEntityWithoutRelations = removePropertiesFromRecord(
    indexMetadataEntity,
    getMetadataEntityRelationProperties('index'),
  );

  return {
    ...indexMetadataEntityWithoutRelations,
    createdAt: indexMetadataEntity.createdAt.toISOString(),
    updatedAt: indexMetadataEntity.updatedAt.toISOString(),
    universalIdentifier:
      indexMetadataEntityWithoutRelations.universalIdentifier ??
      indexMetadataEntityWithoutRelations.id,
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
  };
};
