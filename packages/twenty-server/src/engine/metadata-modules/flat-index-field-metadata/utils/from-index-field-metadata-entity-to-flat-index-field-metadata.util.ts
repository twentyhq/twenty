import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { INDEX_FIELD_METADATA_ENTITY_RELATION_PROPERTIES } from 'src/engine/metadata-modules/flat-index-field-metadata/constants/index-field-metadata-entity-relation-properties.constant';
import { type FlatIndexFieldMetadata } from 'src/engine/metadata-modules/flat-index-field-metadata/types/flat-index-field-metadata.type';
import { type IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-field-metadata.entity';

export const fromIndexFieldMetadataEntityToFlatIndexFieldMetadata = (
  indexFieldMetadataEntity: IndexFieldMetadataEntity,
): FlatIndexFieldMetadata => {
  const indexFieldMetadataEntityWithoutRelations = removePropertiesFromRecord(
    indexFieldMetadataEntity,
    [...INDEX_FIELD_METADATA_ENTITY_RELATION_PROPERTIES],
  );

  return {
    ...indexFieldMetadataEntityWithoutRelations,
    universalIdentifier:
      indexFieldMetadataEntityWithoutRelations.universalIdentifier ??
      indexFieldMetadataEntityWithoutRelations.id,
  };
};
