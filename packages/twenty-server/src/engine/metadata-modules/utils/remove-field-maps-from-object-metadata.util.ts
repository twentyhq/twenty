import omit from 'lodash.omit';

import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

export const removeFieldMapsFromObjectMetadata = (
  objectMetadataMapItem: ObjectMetadataItemWithFieldMaps,
): ObjectMetadataInterface => {
  return {
    ...omit(objectMetadataMapItem, [
      'fieldsById',
      'fieldIdByName',
      'fieldIdByJoinColumnName',
    ]),
    fields: Object.values(objectMetadataMapItem.fieldsById),
  };
};
