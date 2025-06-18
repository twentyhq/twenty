import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { computeTableName } from './compute-table-name.util';

export const computeObjectTargetTable = (
  objectMetadata: Pick<ObjectMetadataInterface, 'nameSingular' | 'isCustom'>,
) => {
  return computeTableName(objectMetadata.nameSingular, objectMetadata.isCustom);
};
