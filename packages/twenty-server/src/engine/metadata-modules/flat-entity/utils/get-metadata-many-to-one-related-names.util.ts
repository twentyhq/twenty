import { type AllMetadataName } from 'twenty-shared/metadata';

import { ALL_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-relations.constant';
import { type MetadataManyToOneRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/types/metadata-many-to-one-related-metadata-names.type';

export const getMetadataManyToOneRelatedNames = <T extends AllMetadataName>(
  metadataName: T,
): MetadataManyToOneRelatedMetadataNames<T>[] => {
  const relations = ALL_METADATA_RELATIONS[metadataName];

  return Object.values(relations.manyToOne)
    .filter((relation) => relation !== null)
    .map(
      (relation) => relation.metadataName,
    ) as MetadataManyToOneRelatedMetadataNames<T>[];
};
