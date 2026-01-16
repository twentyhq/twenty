import {
  ALL_METADATA_NAME,
  type AllMetadataName,
} from 'twenty-shared/metadata';

import { ALL_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-relations.constant';

const countOneToManyRelations = (metadataName: AllMetadataName): number => {
  const relations = ALL_METADATA_RELATIONS[metadataName];

  return Object.values(relations.oneToMany).filter(
    (relation) => relation !== null,
  ).length;
};

export const sortMetadataNamesChildrenFirst = (): AllMetadataName[] => {
  const metadataNames = Object.keys(ALL_METADATA_NAME) as AllMetadataName[];

  return metadataNames.sort((metadataNameA, metadataNameB) => {
    const oneToManyCountA = countOneToManyRelations(metadataNameA);
    const oneToManyCountB = countOneToManyRelations(metadataNameB);

    if (oneToManyCountA !== oneToManyCountB) {
      return oneToManyCountA - oneToManyCountB;
    }

    return metadataNameA.localeCompare(metadataNameB);
  });
};
