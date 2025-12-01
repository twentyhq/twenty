export type WorkspaceLocalCacheEntry<T> = {
  data: T;
  hash: string;
  lastCheckedAt: number;
};
