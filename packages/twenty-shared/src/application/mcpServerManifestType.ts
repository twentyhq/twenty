import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

export type McpServerManifest = SyncableEntityOptions & {
  name: string;
  label: string;
  url: string;
  connectionProviderUniversalIdentifier?: string;
  /** @deprecated Use `connectionProviderUniversalIdentifier` instead. */
  connectionProvider?: SyncableEntityOptions;
};
