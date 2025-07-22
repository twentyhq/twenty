import omit from 'lodash.omit';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

export const getObjectMetadataFromObjectMetadataItemWithFieldMaps = (
  objectMetadataMapItem: ObjectMetadataItemWithFieldMaps,
): ObjectMetadataEntity => {
  return {
    ...omit(objectMetadataMapItem, [
      'fieldsById',
      'fieldIdByName',
      'fieldIdByJoinColumnName',
    ]),
    fields: Object.values(objectMetadataMapItem.fieldsById),
  };
};
