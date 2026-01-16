import {
  ALL_METADATA_NAME,
  type AllMetadataName,
} from 'twenty-shared/metadata';

import { getMetadataOneToManyRelatedNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-one-to-many-related-names.util';

export const sortMetadataNamesChildrenFirst = (): AllMetadataName[] => {
  const metadataNames = Object.keys(ALL_METADATA_NAME) as AllMetadataName[];

  return metadataNames.sort((metadataNameA, metadataNameB) => {
    const oneToManyCountA = getMetadataOneToManyRelatedNames(metadataNameA).length;
    const oneToManyCountB = getMetadataOneToManyRelatedNames(metadataNameB).length;

    if (oneToManyCountA !== oneToManyCountB) {
      return oneToManyCountA - oneToManyCountB;
    }

    return metadataNameA.localeCompare(metadataNameB);
  });
};
