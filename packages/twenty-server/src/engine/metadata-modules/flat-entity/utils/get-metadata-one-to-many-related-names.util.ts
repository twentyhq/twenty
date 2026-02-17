import { type AllMetadataName } from 'twenty-shared/metadata';

import { ALL_ONE_TO_MANY_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-one-to-many-metadata-relations.constant';
import { type MetadataOneToManyRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/types/metadata-one-to-many-related-metadata-names.type';

export const getMetadataOneToManyRelatedNames = <T extends AllMetadataName>(
  metadataName: T,
): MetadataOneToManyRelatedMetadataNames<T>[] => {
  return Object.values(ALL_ONE_TO_MANY_METADATA_RELATIONS[metadataName])
    .filter((relation) => relation !== null)
    .map(
      (relation) => relation.metadataName,
    ) as MetadataOneToManyRelatedMetadataNames<T>[];
};
