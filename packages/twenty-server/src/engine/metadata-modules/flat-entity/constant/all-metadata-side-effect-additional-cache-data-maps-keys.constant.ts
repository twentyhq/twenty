import { type AllMetadataName } from 'twenty-shared/metadata';

import { type AdditionalCacheDataMaps } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

export const ALL_METADATA_SIDE_EFFECT_ADDITIONAL_CACHE_DATA_MAPS_KEYS = {
  role: ['apiKeyMap'],
} as const satisfies Partial<
  Record<AllMetadataName, readonly (keyof AdditionalCacheDataMaps)[]>
>;
