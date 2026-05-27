import { type IndexFieldManifest } from '@/application/indexFieldManifestType';
import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

export type IndexManifest = SyncableEntityOptions & {
  objectUniversalIdentifier: string;
  indexType?: 'BTREE' | 'GIN';
  isUnique?: boolean;
  fields: IndexFieldManifest[];
};
