import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

import { computeTableName } from './compute-table-name.util';

export const computeObjectTargetTable = (
  objectMetadata:
    | Pick<ObjectMetadataEntity, 'nameSingular' | 'isCustom'>
    | ObjectMetadataItemWithFieldMaps,
) => {
  return computeTableName(objectMetadata.nameSingular, objectMetadata.isCustom);
};
