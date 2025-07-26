import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

import { computeTableName } from './compute-table-name.util';

export const computeObjectTargetTable = (
  objectMetadata: Pick<ObjectMetadataEntity, 'nameSingular' | 'isCustom'>,
) => {
  return computeTableName(objectMetadata.nameSingular, objectMetadata.isCustom);
};
