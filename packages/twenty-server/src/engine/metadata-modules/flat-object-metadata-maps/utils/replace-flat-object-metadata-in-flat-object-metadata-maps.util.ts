import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { addFlatObjectMetadataToFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-object-metadata-to-flat-object-metadata-maps.util';
import { deleteObjectFromFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/delete-object-from-flat-object-metadata-maps.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const replaceFlatObjectMetadataInFlatObjectMetadataMaps = ({
  flatObjectMetadata,
  flatObjectMetadataMaps,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps: FlatObjectMetadataMaps;
}) => {
  const flatObjectMetadataMapsWithoutFlatObjectMetadataToReplace =
    deleteObjectFromFlatObjectMetadataMaps({
      flatObjectMetadataMaps,
      objectMetadataId: flatObjectMetadata.id,
    });

  return addFlatObjectMetadataToFlatObjectMetadataMaps({
    flatObjectMetadata,
    flatObjectMetadataMaps:
      flatObjectMetadataMapsWithoutFlatObjectMetadataToReplace,
  });
};
