import {
  ALL_METADATA_NAME,
  type AllMetadataName,
} from 'twenty-shared/metadata';

import { getMetadataManyToOneRelatedNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-many-to-one-related-names.util';
import { getMetadataOneToManyRelatedNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-one-to-many-related-names.util';

// Computes a "dependency score" for each metadata entity
// Higher score = more dependent (should be deleted first)
// Score = manyToOne count - oneToMany count
const computeDependencyScore = (metadataName: AllMetadataName): number => {
  const manyToOneCount = getMetadataManyToOneRelatedNames(metadataName).length;
  const oneToManyCount = getMetadataOneToManyRelatedNames(metadataName).length;

  return manyToOneCount - oneToManyCount;
};

// Sorts metadata names with children first (entities that depend on others)
// and parents last (entities that others depend on)
// This order mitigates ON DELETE CASCADE overhead in PostgreSQL
export const sortMetadataNamesChildrenFirst = (): AllMetadataName[] => {
  const metadataNames = Object.keys(ALL_METADATA_NAME) as AllMetadataName[];

  return metadataNames.sort((metadataNameA, metadataNameB) => {
    const scoreA = computeDependencyScore(metadataNameA);
    const scoreB = computeDependencyScore(metadataNameB);

    // Higher score = more dependent = should be deleted first
    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }

    return metadataNameA.localeCompare(metadataNameB);
  });
};
