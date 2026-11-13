import {
  type WorkspaceCacheDataMap,
  type WorkspaceCacheKeyName,
} from 'src/engine/workspace-cache/types/workspace-cache-key.type';

export type WorkspaceDerivedCacheSourceKeyName = {
  [
    TCacheKeyName in WorkspaceCacheKeyName
  ]: WorkspaceCacheDataMap[TCacheKeyName] extends object
    ? TCacheKeyName
    : never;
}[WorkspaceCacheKeyName];
