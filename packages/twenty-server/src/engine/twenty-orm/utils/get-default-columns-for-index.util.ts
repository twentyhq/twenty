import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';

export const getColumnsForIndex = (indexType?: IndexType) => {
  switch (indexType) {
    case IndexType.GIN:
      return [];
    default:
      return ['deletedAt'];
  }
};
