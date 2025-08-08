import { ALL_FLAT_OBJECT_METADATA_MOCKS } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/all-flat-object.mock';
import { fromFlatObjectMetadatasToFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadatas-to-flat-object-metadata-maps.util';

export const FLAT_OBJECT_METADATA_MAPS_MOCKS =
  fromFlatObjectMetadatasToFlatObjectMetadataMaps([
    ...ALL_FLAT_OBJECT_METADATA_MOCKS,
  ]);
