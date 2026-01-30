import { type ApplicationVariables } from './applicationVariablesType';
import { type SyncableEntityOptions } from './syncableEntityOptionsType';

export type ApplicationManifest = SyncableEntityOptions & {
  defaultRoleUniversalIdentifier: string;
  displayName?: string;
  description?: string;
  icon?: string;
  applicationVariables?: ApplicationVariables;
};
