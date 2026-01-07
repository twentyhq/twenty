import { type AllMetadataName } from 'twenty-shared/metadata';

import { ALL_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-relations.constant';
import { type MetadataManyToOneRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/types/metadata-many-to-one-related-metadata-names.type';
import { type MetadataOneToManyRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/types/metadata-one-to-many-related-metadata-names.type';

export const getMetadataRelatedMetadataNames = <T extends AllMetadataName>(
  metadataName: T,
) => {
  const relationProperties = ALL_METADATA_RELATIONS[metadataName];

  const manyToOneMetadataNames = Object.values(relationProperties.manyToOne)
    .filter((relation) => relation !== null)
    .map((relation) => relation.metadataName);

  const oneToManyMetadataNames = Object.values(relationProperties.oneToMany)
    .filter((relation) => relation !== null)
    .map((relation) => relation.metadataName);

  return [
    ...new Set([...manyToOneMetadataNames, ...oneToManyMetadataNames]),
  ] as (
    | MetadataOneToManyRelatedMetadataNames<T>
    | MetadataManyToOneRelatedMetadataNames<T>
  )[];
};
