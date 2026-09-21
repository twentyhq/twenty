import { type IndexFieldManifest } from '@/application/indexFieldManifestType';
import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import { type IndexType } from '@/types';

export type IndexManifest = SyncableEntityOptions & {
  objectUniversalIdentifier: string;
  indexType?: `${IndexType}`;
  isUnique?: boolean;
  fields: IndexFieldManifest[];
};
