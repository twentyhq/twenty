import { type AllMetadataName } from 'twenty-shared/metadata';

import { ALL_METADATA_SIDE_EFFECT_ADDITIONAL_CACHE_DATA_MAPS_KEYS } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-side-effect-additional-cache-data-maps-keys.constant';
import { type MetadataSideEffectAdditionalCacheDataMapsKey } from 'src/engine/metadata-modules/flat-entity/types/metadata-side-effect-additional-cache-data-maps.type';
import { type AdditionalCacheDataMaps } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

export const getMetadataSideEffectAdditionalCacheDataMapsKeys = <
  T extends AllMetadataName,
>(
  metadataName: T,
): MetadataSideEffectAdditionalCacheDataMapsKey<T>[] => {
  const additionalCacheDataMapsKeysByMetadataName =
    ALL_METADATA_SIDE_EFFECT_ADDITIONAL_CACHE_DATA_MAPS_KEYS as Partial<
      Record<AllMetadataName, readonly (keyof AdditionalCacheDataMaps)[]>
    >;

  return (additionalCacheDataMapsKeysByMetadataName[metadataName] ??
    []) as MetadataSideEffectAdditionalCacheDataMapsKey<T>[];
};
