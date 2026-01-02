import { type AllMetadataName } from 'twenty-shared/metadata';

import { ALL_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-relations.constant';

export const getMetadataEntityRelationProperties = <T extends AllMetadataName>(
  metadataName: T,
) => {
  const relationProperties = ALL_METADATA_RELATIONS[metadataName];

  return [
    ...Object.keys(relationProperties.manyToOne),
    ...Object.keys(relationProperties.oneToMany),
  ] as (
    | keyof (typeof ALL_METADATA_RELATIONS)[T]['manyToOne']
    | keyof (typeof ALL_METADATA_RELATIONS)[T]['oneToMany']
  )[];
};
