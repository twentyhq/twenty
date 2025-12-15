export type VersionEntry<T> = {
  data: T;
  lastReadAt: number;
};

export type WorkspaceLocalCacheEntry<T> = {
  versions: Map<string, VersionEntry<T>>;
  latestHash: string;
  lastHashCheckedAt: number;
};
