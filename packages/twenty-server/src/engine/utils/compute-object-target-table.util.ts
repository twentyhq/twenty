import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

import { computeTableName } from './compute-table-name.util';

export const computeObjectTargetTable = (
  objectMetadata: Pick<
    UniversalFlatObjectMetadata,
    'nameSingular' | 'isCustom'
  >,
) => {
  return computeTableName(objectMetadata.nameSingular, objectMetadata.isCustom);
};
