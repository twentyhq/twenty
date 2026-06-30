import {
  ALL_METADATA_NAME,
  type AllMetadataName,
} from 'twenty-shared/metadata';

import { getMetadataManyToOneRelatedNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-many-to-one-related-names.util';
import { getMetadataOneToManyRelatedNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-one-to-many-related-names.util';

const computeDependencyScore = (metadataName: AllMetadataName): number => {
  const manyToOneCount = getMetadataManyToOneRelatedNames(metadataName).length;
  const oneToManyCount = getMetadataOneToManyRelatedNames(metadataName).length;

  return manyToOneCount - oneToManyCount;
};

export const sortMetadataNamesChildrenFirst = (): AllMetadataName[] => {
  const metadataNames = Object.keys(ALL_METADATA_NAME) as AllMetadataName[];

  return metadataNames.sort((metadataNameA, metadataNameB) => {
    const scoreA = computeDependencyScore(metadataNameA);
    const scoreB = computeDependencyScore(metadataNameB);

    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }

    return metadataNameA.localeCompare(metadataNameB);
  });
};
