import {
  type CacheEntityFetchShape,
  type CacheEntityFetchShapeRows,
} from 'src/engine/workspace-cache/types/cache-entity-fetch-shape.type';

// What computeForCache receives: the batch-fetched rows matching the
// provider's rowsRequirement, plus the workspace scope. Providers type it
// with `typeof` their requirement constant to get precisely typed rows.
export type WorkspaceCacheProviderContext<
  TShape extends CacheEntityFetchShape = CacheEntityFetchShape,
> = {
  workspaceId: string;
  rows: CacheEntityFetchShapeRows<TShape>;
};
