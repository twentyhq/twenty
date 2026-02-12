import { type AdditionalCacheDataMaps } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

export const WORKSPACE_MIGRATION_ADDITIONAL_CACHE_DATA_MAPS_KEY = [
  'featureFlagsMap',
] as const satisfies (keyof AdditionalCacheDataMaps)[];
