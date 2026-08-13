export type LiveVersionEntry<T> = {
  state: 'live';
  data: T;
  lastReadAt: number;
};

export type PackedVersionEntry = {
  state: 'packed';
  blob: Buffer;
  lastReadAt: number;
};

export type VersionEntry<T> = LiveVersionEntry<T> | PackedVersionEntry;

export type WorkspaceLocalCacheEntry<T> = {
  versions: Map<string, VersionEntry<T>>;
  latestHash: string;
  lastHashCheckedAt: number;
};
