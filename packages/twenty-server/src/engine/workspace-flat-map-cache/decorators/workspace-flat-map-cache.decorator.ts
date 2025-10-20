import { SetMetadata } from '@nestjs/common';

import { type AllMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-metadata-name.type';
import { type MetadataToFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/types/metadata-to-flat-entity-maps-key';

export const WORKSPACE_FLAT_MAP_CACHE_KEY = 'workspaceFlatMapCacheKey';

export const WorkspaceFlatMapCache = (
  cacheKey: MetadataToFlatEntityMapsKey<AllMetadataName>,
) => SetMetadata(WORKSPACE_FLAT_MAP_CACHE_KEY, cacheKey);
