import { type AllMetadataName } from 'twenty-shared/metadata';

import { ALL_METADATA_SERIALIZED_RELATION } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-serialized-relation.constant';

export const getMetadataSerializedRelationNames = (
  metadataName: AllMetadataName,
): AllMetadataName[] => {
  return Object.keys(
    ALL_METADATA_SERIALIZED_RELATION[metadataName],
  ) as AllMetadataName[];
};
