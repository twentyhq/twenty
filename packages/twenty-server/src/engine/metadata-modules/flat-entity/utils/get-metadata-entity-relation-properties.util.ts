import { type AllMetadataName } from 'twenty-shared/metadata';

import { ALL_METADATA_RELATION_PROPERTIES } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-relations-properties.constant';

export const getMetadataEntityRelationProperties = <T extends AllMetadataName>(
  metadataName: T,
) => {
  const relationProperties = ALL_METADATA_RELATION_PROPERTIES[metadataName];

  return [
    ...Object.keys(relationProperties.manyToOne),
    ...Object.keys(relationProperties.oneToMany),
  ] as (keyof (typeof ALL_METADATA_RELATION_PROPERTIES)[T]['manyToOne'] &
    keyof (typeof ALL_METADATA_RELATION_PROPERTIES)[T]['oneToMany'])[];
};
