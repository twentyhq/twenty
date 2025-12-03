export type VersionEntry<T> = {
  data: T;
  createdAt: number;
};

export type WorkspaceLocalCacheEntry<T> = {
  versions: Map<string, VersionEntry<T>>;
  latestHash: string;
  lastCheckedAt: number;
};
