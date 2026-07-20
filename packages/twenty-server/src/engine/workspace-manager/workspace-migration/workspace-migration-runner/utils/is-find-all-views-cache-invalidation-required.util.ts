import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { FIND_ALL_VIEWS_CACHE_DEPENDENCY_KEYS } from 'src/engine/workspace-cache-storage/constants/find-all-views-cache-dependency-keys.constant';

const findAllViewsCacheDependencyKeys: ReadonlySet<string> = new Set(
  FIND_ALL_VIEWS_CACHE_DEPENDENCY_KEYS,
);

export const isFindAllViewsCacheInvalidationRequired = (
  allFlatEntityMapsKeys: (keyof AllFlatEntityMaps)[],
): boolean =>
  allFlatEntityMapsKeys.some((key) => findAllViewsCacheDependencyKeys.has(key));
