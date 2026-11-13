import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import { type OrderByDirection } from '@/types';

export type IndexFieldManifest = SyncableEntityOptions & {
  fieldUniversalIdentifier: string;
  subFieldName?: string;
  direction?: OrderByDirection;
};
