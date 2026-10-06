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
  hash: string;
  version: VersionEntry<T>;
  lastHashCheckedAt: number;
};
