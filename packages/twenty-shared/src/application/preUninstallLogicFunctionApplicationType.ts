import type { SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

export type PreUninstallLogicFunctionApplicationManifest =
  SyncableEntityOptions & {
    universalIdentifier: string;
  };
