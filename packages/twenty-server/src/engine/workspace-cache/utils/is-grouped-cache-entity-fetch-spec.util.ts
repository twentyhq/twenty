import {
  type GroupedCacheEntityFetchSpec,
  type WidenedCacheEntityFetchSpec,
} from 'src/engine/workspace-cache/types/cache-entity-fetch-shape.type';

export const isGroupedCacheEntityFetchSpec = (
  fetchSpec: WidenedCacheEntityFetchSpec,
): fetchSpec is GroupedCacheEntityFetchSpec =>
  fetchSpec !== true && !Array.isArray(fetchSpec);
