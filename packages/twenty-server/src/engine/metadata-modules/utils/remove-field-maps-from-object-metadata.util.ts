import omit from 'lodash.omit';

import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

export const removeFieldMapsFromObjectMetadata = (
  objectMetadata: ObjectMetadataItemWithFieldMaps,
): ObjectMetadataInterface =>
  omit(objectMetadata, ['fieldsById', 'fieldsByName']);
