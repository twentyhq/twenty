import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

type SecretApplicationVariable = SyncableEntityOptions & {
  description?: string;
  isSecret: true;
};

type NonSecretApplicationVariable = SyncableEntityOptions & {
  value?: string;
  description?: string;
  isSecret?: false;
};

export type ApplicationVariable =
  | SecretApplicationVariable
  | NonSecretApplicationVariable;

export type ApplicationVariables = Record<string, ApplicationVariable>;
