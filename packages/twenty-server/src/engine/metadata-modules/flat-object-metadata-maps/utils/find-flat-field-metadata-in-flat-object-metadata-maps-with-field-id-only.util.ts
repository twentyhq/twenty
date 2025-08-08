import { isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';

export type FindFlatFieldMetadataInFlatObjectMetadataMapsWithOnlyFieldIdArgs = {
  fieldMetadataId: string;
  flatObjectMetadataMaps: FlatObjectMetadataMaps;
};
// TODO add tests
export const findFlatFieldMetadataInFlatObjectMetadataMapsWithOnlyFieldId = ({
  flatObjectMetadataMaps,
  fieldMetadataId,
}: FindFlatFieldMetadataInFlatObjectMetadataMapsWithOnlyFieldIdArgs):
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
