import { type RecordEventTriggerManifestAction } from '@/application/recordEventTriggerManifestActionType';

export type RecordEventTriggerManifestSettings = {
  on: 'recordEvent';
  // Every object when left out; a condition needs one object to read
  objectUniversalIdentifier?: string;
  action: RecordEventTriggerManifestAction;
  watchedFieldUniversalIdentifiers?: string[];
  condition?: string;
  batchMode?: boolean;
};
