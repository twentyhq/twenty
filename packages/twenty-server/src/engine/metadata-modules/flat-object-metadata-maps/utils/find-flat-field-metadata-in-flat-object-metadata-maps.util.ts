import { isDefined } from 'twenty-shared/utils';

import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';

export type FindFlatFieldMetadataInFlatObjectMetadataMapsArgs = {
  objectMetadataId: string;
  fieldMetadataId: string;
  flatObjectMetadataMaps: FlatObjectMetadataMaps;
};
export const findFlatFieldMetadataInFlatObjectMetadataMaps = ({
  flatObjectMetadataMaps,
  fieldMetadataId,
  objectMetadataId,
}: FindFlatFieldMetadataInFlatObjectMetadataMapsArgs):
  | FlatFieldMetadata
  | undefined => {
  const flatObjectMetadataWithFlatFieldMaps =
    flatObjectMetadataMaps.byId[objectMetadataId];

  if (!isDefined(flatObjectMetadataWithFlatFieldMaps)) {
    return undefined;
  }

  const flatFieldMetadata =
    flatObjectMetadataWithFlatFieldMaps.fieldsById[fieldMetadataId];

  if (!isDefined(flatFieldMetadata)) {
    return undefined;
  }

  return flatFieldMetadata;
};
