import { type AllMetadataName } from 'twenty-shared/metadata';

import { ALL_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-relations.constant';

export const getMetadataSerializedRelationNames = (
  metadataName: AllMetadataName,
): AllMetadataName[] => {
  const relations = ALL_METADATA_RELATIONS[metadataName];

  if (!('serializedRelations' in relations)) {
    return [];
  }

  return Object.keys(relations.serializedRelations) as AllMetadataName[];
};
