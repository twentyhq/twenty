import {
  ALL_METADATA_NAME,
  type AllMetadataName,
} from 'twenty-shared/metadata';

import { EMPTY_FLAT_ENTITY_MAPS } from 'src/engine/metadata-modules/flat-entity/constant/empty-flat-entity-maps.constant';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';

export const EMPTY_ALL_FLAT_ENTITY_MAPS = (
  Object.keys(ALL_METADATA_NAME) as AllMetadataName[]
).reduce<AllFlatEntityMaps>(
  (acc, metadataName) => ({
    ...acc,
    [getMetadataFlatEntityMapsKey(metadataName)]: EMPTY_FLAT_ENTITY_MAPS,
  }),
  {} as AllFlatEntityMaps,
);
