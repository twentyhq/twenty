import { type ValidationRuleDatabaseEventAction } from '@/types/ValidationRuleDatabaseEventAction';

export type DatabaseEventTriggerManifestAction =
  | ValidationRuleDatabaseEventAction
  | '*';
