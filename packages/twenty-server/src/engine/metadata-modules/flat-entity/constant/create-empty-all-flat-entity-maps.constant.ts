import {
  ALL_METADATA_NAME,
  type AllMetadataName,
} from 'twenty-shared/metadata';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';

export const createEmptyAllFlatEntityMaps = (): AllFlatEntityMaps =>
  (
    Object.keys(ALL_METADATA_NAME) as AllMetadataName[]
  ).reduce<AllFlatEntityMaps>(
    (acc, metadataName) => ({
      ...acc,
      [getMetadataFlatEntityMapsKey(metadataName)]: createEmptyFlatEntityMaps(),
    }),
    {} as AllFlatEntityMaps,
  );
