import { SetMetadata } from '@nestjs/common';

import { type ALL_FLAT_ENTITY_MAPS_PROPERTIES } from 'src/engine/core-modules/common/constant/all-flat-entity-maps-properties.constant';

export const WORKSPACE_FLAT_MAP_CACHE_KEY = 'workspaceFlatMapCacheKey';

export const WorkspaceFlatMapCache = (
  cacheKey: (typeof ALL_FLAT_ENTITY_MAPS_PROPERTIES)[number],
) => SetMetadata(WORKSPACE_FLAT_MAP_CACHE_KEY, cacheKey);
