import { type ValidationRuleDatabaseEventAction } from '@/types/ValidationRuleDatabaseEventAction';

export type RecordEventTriggerManifestAction =
  | ValidationRuleDatabaseEventAction
  | '*';
