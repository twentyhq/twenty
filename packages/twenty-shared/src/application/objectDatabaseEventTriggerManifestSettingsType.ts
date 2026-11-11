import { type DatabaseEventTriggerManifestAction } from '@/application/databaseEventTriggerManifestActionType';

export type ObjectDatabaseEventTriggerManifestSettings = {
  // Every object when left out; a condition needs one object to read
  objectUniversalIdentifier?: string;
  action: DatabaseEventTriggerManifestAction;
  fieldUniversalIdentifiers?: string[];
  condition?: string;
  batchMode?: boolean;
};
