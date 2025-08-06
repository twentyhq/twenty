import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { addFlatObjectMetadataToFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-object-metadata-to-flat-object-metadata-maps-or-throw.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const fromFlatObjectMetadatasToFlatObjectMetadataMaps = (
  flatObjectMetadatas: FlatObjectMetadata[],
) => {
  const emptyFlatObjectMetadataMaps: FlatObjectMetadataMaps = {
    byId: {},
    idByNameSingular: {},
  };

  return flatObjectMetadatas.reduce(
    (flatObjectMetadataMaps, flatObjectMetadata) =>
      addFlatObjectMetadataToFlatObjectMetadataMapsOrThrow({
        flatObjectMetadata,
        flatObjectMetadataMaps,
      }),
    emptyFlatObjectMetadataMaps,
  );
};
