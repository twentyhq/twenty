import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

// Apps cannot declare unique indexes, partial-WHERE clauses, or per-field
// custom column resolution. Those are reserved for the framework + admin UI.
export type IndexFieldManifest = SyncableEntityOptions & {
  fieldUniversalIdentifier: string;
  subFieldName?: string;
};

export type IndexManifest = SyncableEntityOptions & {
  objectUniversalIdentifier: string;
  indexType?: 'BTREE' | 'GIN';
  fields: IndexFieldManifest[];
};
