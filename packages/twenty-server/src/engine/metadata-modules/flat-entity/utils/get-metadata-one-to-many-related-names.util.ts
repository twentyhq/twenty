import { type AllMetadataName } from 'twenty-shared/metadata';

import { ALL_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-relations.constant';
import { type MetadataOneToManyRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/types/metadata-one-to-many-related-metadata-names.type';

export const getMetadataOneToManyRelatedNames = <T extends AllMetadataName>(
  metadataName: T,
): MetadataOneToManyRelatedMetadataNames<T>[] => {
  const relations = ALL_METADATA_RELATIONS[metadataName];

  return Object.values(relations.oneToMany)
    .filter((relation) => relation !== null)
    .map(
      (relation) => relation.metadataName,
    ) as MetadataOneToManyRelatedMetadataNames<T>[];
};
