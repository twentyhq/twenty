import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { FlatObjectMetadataWithFlatFieldMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-with-flat-field-metadata-maps.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const fromFlatObjectMetadataWithFlatFieldMapsToFlatObjectMetadata = (
  flatObjectMetadataWithFlatFieldMaps: FlatObjectMetadataWithFlatFieldMaps,
): FlatObjectMetadata => {
  return removePropertiesFromRecord(flatObjectMetadataWithFlatFieldMaps, [
    'fieldsById',
    'fieldIdByName',
    'fieldIdByJoinColumnName',
  ]);
};
