import { type AllMetadataName } from 'twenty-shared/metadata';

import { ALL_MANY_TO_ONE_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-many-to-one-metadata-relations.constant';
import { ALL_ONE_TO_MANY_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-one-to-many-metadata-relations.constant';

export const getMetadataEntityRelationProperties = <T extends AllMetadataName>(
  metadataName: T,
) => {
  return [
    ...Object.keys(ALL_MANY_TO_ONE_METADATA_RELATIONS[metadataName]),
    ...Object.keys(ALL_ONE_TO_MANY_METADATA_RELATIONS[metadataName]),
  ] as (
    | keyof (typeof ALL_MANY_TO_ONE_METADATA_RELATIONS)[T]
    | keyof (typeof ALL_ONE_TO_MANY_METADATA_RELATIONS)[T]
  )[];
};
