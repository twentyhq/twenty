import { type ApplicationVariables } from '@/sdk';
import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

export type ApplicationManifest = SyncableEntityOptions & {
  defaultRoleUniversalIdentifier: string;
  displayName?: string;
  description?: string;
  icon?: string;
  applicationVariables?: ApplicationVariables;
};
