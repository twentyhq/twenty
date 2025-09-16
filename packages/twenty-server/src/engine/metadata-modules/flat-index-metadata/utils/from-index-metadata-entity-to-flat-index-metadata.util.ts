import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { INDEX_METADATA_ENTITY_RELATION_PROPERTIES } from 'src/engine/metadata-modules/flat-index-metadata/constants/index-metadata-entity-relation-properties.constant';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';

export const fromIndexMetadataEntityToFlatIndexMetadata = (
  indexMetadataEntity: IndexMetadataEntity,
): FlatIndexMetadata => {
  const indexMetadataEntityWithoutRelations = removePropertiesFromRecord(
    indexMetadataEntity,
    [...INDEX_METADATA_ENTITY_RELATION_PROPERTIES],
  );

  return {
    ...indexMetadataEntityWithoutRelations,
    universalIdentifier:
      indexMetadataEntityWithoutRelations.universalIdentifier ??
      indexMetadataEntityWithoutRelations.id,
    flatIndexFieldMetadatas: indexMetadataEntity.indexFieldMetadatas.map(
      (indexFieldMetadata) =>
        removePropertiesFromRecord(indexFieldMetadata, [
          'indexMetadata',
          'fieldMetadata',
        ]),
    ),
  };
};
