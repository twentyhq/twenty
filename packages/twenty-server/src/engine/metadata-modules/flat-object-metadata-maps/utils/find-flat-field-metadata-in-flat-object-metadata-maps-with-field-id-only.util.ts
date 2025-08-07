import { isDefined } from 'twenty-shared/utils';

import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';

export type FindFlatFieldMetadataInFlatObjectMetadataMapsWithOnlyFielIdArgs = {
  fieldMetadataId: string;
  flatObjectMetadataMaps: FlatObjectMetadataMaps;
};
// TODO add tests
export const findFlatFieldMetadataInFlatObjectMetadataMapsWithOnlyFielId = ({
  flatObjectMetadataMaps,
  fieldMetadataId,
}: FindFlatFieldMetadataInFlatObjectMetadataMapsWithOnlyFielIdArgs):
  | FlatFieldMetadata
  | undefined => {
  const flatObjectMetadataWithFlatFieldMapsArray = Object.values(
    flatObjectMetadataMaps.byId,
  ).filter(isDefined);

  const matchingFlatObjectMetadataWithFlatFieldMaps =
    flatObjectMetadataWithFlatFieldMapsArray.find(
      (flatObjectMetadataWithFlatFieldMaps) =>
        isDefined(
          flatObjectMetadataWithFlatFieldMaps.fieldsById[fieldMetadataId],
        ),
    );

  return matchingFlatObjectMetadataWithFlatFieldMaps?.fieldsById[
    fieldMetadataId
  ];
};
