export type WorkspaceContextLocalCacheEntry<T> = {
  data: T;
  hash: string;
  lastCheckedAt: number;
};
