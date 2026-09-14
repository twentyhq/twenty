import { type AllMetadataName } from 'twenty-shared/metadata';

import { type ALL_METADATA_SIDE_EFFECT_ADDITIONAL_CACHE_DATA_MAPS_KEYS } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-side-effect-additional-cache-data-maps-keys.constant';
import { type AdditionalCacheDataMaps } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

export type MetadataSideEffectAdditionalCacheDataMapsKey<
  T extends AllMetadataName,
> =
  T extends keyof typeof ALL_METADATA_SIDE_EFFECT_ADDITIONAL_CACHE_DATA_MAPS_KEYS
    ? (typeof ALL_METADATA_SIDE_EFFECT_ADDITIONAL_CACHE_DATA_MAPS_KEYS)[T][number]
    : never;

export type MetadataSideEffectAdditionalCacheDataMaps<
  T extends AllMetadataName,
> = Pick<
  AdditionalCacheDataMaps,
  MetadataSideEffectAdditionalCacheDataMapsKey<T>
>;
