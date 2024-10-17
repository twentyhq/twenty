import { IndexType } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';

export const getColumnsForIndex = (indexType?: IndexType) => {
  switch (indexType) {
    case IndexType.GIN:
      return [];
    default:
      return ['deletedAt'];
  }
};
