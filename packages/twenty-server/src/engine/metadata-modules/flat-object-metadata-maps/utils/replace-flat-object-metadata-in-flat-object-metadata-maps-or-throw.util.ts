import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { addFlatObjectMetadataToFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-object-metadata-to-flat-object-metadata-maps-or-throw.util';
import { deleteObjectFromFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/delete-object-from-flat-object-metadata-maps-or-throw.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type ReplaceFlatObjectMetadataInFlatObjectMetadataMapsOrThrowArgs = {
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps: FlatObjectMetadataMaps;
};
export const replaceFlatObjectMetadataInFlatObjectMetadataMapsOrThrow = ({
  flatObjectMetadata,
  flatObjectMetadataMaps,
}: ReplaceFlatObjectMetadataInFlatObjectMetadataMapsOrThrowArgs) => {
  const flatObjectMetadataMapsWithoutFlatObjectMetadataToReplace =
    deleteObjectFromFlatObjectMetadataMapsOrThrow({
      flatObjectMetadataMaps,
      objectMetadataId: flatObjectMetadata.id,
    });

  return addFlatObjectMetadataToFlatObjectMetadataMapsOrThrow({
    flatObjectMetadata,
    flatObjectMetadataMaps:
      flatObjectMetadataMapsWithoutFlatObjectMetadataToReplace,
  });
};
