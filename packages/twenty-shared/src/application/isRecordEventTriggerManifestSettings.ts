import { type EventTriggerManifestSettings } from '@/application/eventTriggerManifestSettingsType';
import { type DatabaseEventTriggerSettings } from '@/application/logicFunctionManifestType';
import { type RecordEventTriggerManifestSettings } from '@/application/recordEventTriggerManifestSettingsType';

export const isRecordEventTriggerManifestSettings = (
  settings: EventTriggerManifestSettings | DatabaseEventTriggerSettings,
): settings is RecordEventTriggerManifestSettings =>
  'on' in settings && settings.on === 'recordEvent';
