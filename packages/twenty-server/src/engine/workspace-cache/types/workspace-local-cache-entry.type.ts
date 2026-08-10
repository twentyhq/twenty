export type HotVersionEntry<T> = {
  state: 'hot';
  data: T;
  lastReadAt: number;
};

export type ColdVersionEntry = {
  state: 'cold';
  blob: Buffer;
  lastReadAt: number;
};

export type VersionEntry<T> = HotVersionEntry<T> | ColdVersionEntry;

export type WorkspaceLocalCacheEntry<T> = {
  versions: Map<string, VersionEntry<T>>;
  latestHash: string;
  lastHashCheckedAt: number;
};
