// A version is held either as a live object graph (hot) or as a serialized buffer (cold).
// A cold read costs a parse, but the garbage collector treats a buffer as a single opaque node
// instead of traversing the whole graph, and that traversal is what dominates major GC pauses.
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
