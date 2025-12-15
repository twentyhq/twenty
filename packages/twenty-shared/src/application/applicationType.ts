import { type ApplicationVariables } from '@/application';
import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

export type Application = SyncableEntityOptions & {
  displayName?: string;
  description?: string;
  icon?: string;
  applicationVariables?: ApplicationVariables;
  functionRoleUniversalIdentifier?: string;
};
