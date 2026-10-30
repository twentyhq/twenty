import { type SyncableEntityOptions } from './syncableEntityOptionsType';

export type ValidationRuleManifest = SyncableEntityOptions & {
  objectUniversalIdentifier: string;
  name: string;
  description?: string;
  icon?: string;
  expression: string;
  message: string;
  errorFieldUniversalIdentifier?: string;
};
