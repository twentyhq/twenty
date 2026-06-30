import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

export type IndexFieldManifest = SyncableEntityOptions & {
  fieldUniversalIdentifier: string;
  subFieldName?: string;
};
