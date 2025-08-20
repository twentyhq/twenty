import { EMPTY_FLAT_OBJECT_METADATA_MAPS } from 'src/engine/metadata-modules/flat-object-metadata-maps/constant/empty-flat-object-metadata-maps.constant';
import { addFlatObjectMetadataToFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-object-metadata-to-flat-object-metadata-maps-or-throw.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const fromFlatObjectMetadatasToFlatObjectMetadataMaps = (
  flatObjectMetadatas: FlatObjectMetadata[],
) => {
  return flatObjectMetadatas.reduce(
    (flatObjectMetadataMaps, flatObjectMetadata) =>
      addFlatObjectMetadataToFlatObjectMetadataMapsOrThrow({
        flatObjectMetadata,
        flatObjectMetadataMaps,
      }),
    EMPTY_FLAT_OBJECT_METADATA_MAPS,
  );
};
