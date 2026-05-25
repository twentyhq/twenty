import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

// Partial-WHERE clauses stay reserved for the framework + admin UI; apps
// can declare unique indexes (single- or multi-column) — they are the
// primitive for uniqueness at the SDK level.
export type IndexFieldManifest = SyncableEntityOptions & {
  fieldUniversalIdentifier: string;
  subFieldName?: string;
};

export type IndexManifest = SyncableEntityOptions & {
  objectUniversalIdentifier: string;
  indexType?: 'BTREE' | 'GIN';
  isUnique?: boolean;
  fields: IndexFieldManifest[];
};
