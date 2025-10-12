import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

import { computeTableName } from './compute-table-name.util';

export const computeObjectTargetTable = (
  objectMetadata: Pick<FlatObjectMetadata, 'nameSingular' | 'isCustom'>,
) => {
  return computeTableName(objectMetadata.nameSingular, objectMetadata.isCustom);
};
