import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

export type McpServerManifest = SyncableEntityOptions & {
  name: string;
  label: string;
  url: string;
  connectionProvider?: SyncableEntityOptions;
};
