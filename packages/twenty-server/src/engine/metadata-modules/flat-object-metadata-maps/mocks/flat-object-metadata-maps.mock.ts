import { EMPTY_FLAT_ENTITY_MAPS } from 'src/engine/core-modules/common/constant/empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { ALL_FLAT_OBJECT_METADATA_MOCKS } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/all-flat-object-metadatas.mock';

export const FLAT_OBJECT_METADATA_MAPS_MOCKS = [
  ...ALL_FLAT_OBJECT_METADATA_MOCKS,
].reduce(
  (flatObjectMaps, flatObjectMetadata) =>
    addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: flatObjectMetadata,
      flatEntityMaps: flatObjectMaps,
    }),
  EMPTY_FLAT_ENTITY_MAPS,
);
