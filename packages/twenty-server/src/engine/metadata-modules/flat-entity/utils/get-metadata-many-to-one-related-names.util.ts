import { type AllMetadataName } from 'twenty-shared/metadata';

import { ALL_MANY_TO_ONE_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-many-to-one-metadata-relations.constant';
import { type MetadataManyToOneRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/types/metadata-many-to-one-related-metadata-names.type';

export const getMetadataManyToOneRelatedNames = <T extends AllMetadataName>(
  metadataName: T,
): MetadataManyToOneRelatedMetadataNames<T>[] => {
  return Object.values(ALL_MANY_TO_ONE_METADATA_RELATIONS[metadataName])
    .filter((relation) => relation !== null)
    .map(
      (relation) => relation.metadataName,
    ) as MetadataManyToOneRelatedMetadataNames<T>[];
};
