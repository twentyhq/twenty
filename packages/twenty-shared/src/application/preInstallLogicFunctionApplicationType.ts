import type { SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

export type PreInstallLogicFunctionApplicationManifest =
  SyncableEntityOptions & {
    universalIdentifier: string;
    shouldRunOnVersionUpgrade?: boolean;
  };
