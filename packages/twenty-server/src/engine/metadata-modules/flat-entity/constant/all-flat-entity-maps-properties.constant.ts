import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';

export const ALL_FLAT_ENTITY_MAPS_PROPERTIES = Object.keys(
  ALL_METADATA_NAME,
).map(getMetadataFlatEntityMapsKey);
