import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { addFlatObjectMetadataToFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-object-metadata-to-flat-object-metadata-maps.util';
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
      addFlatObjectMetadataToFlatObjectMetadataMaps({
        flatObjectMetadata,
        flatObjectMetadataMaps,
      }),
    emptyFlatObjectMetadataMaps,
  );
};
