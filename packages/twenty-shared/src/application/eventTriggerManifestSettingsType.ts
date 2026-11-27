import { type AppEventTriggerManifestSettings } from '@/application/appEventTriggerManifestSettingsType';
import { type RecordEventTriggerManifestSettings } from '@/application/recordEventTriggerManifestSettingsType';

export type EventTriggerManifestSettings =
  | RecordEventTriggerManifestSettings
  | AppEventTriggerManifestSettings;
