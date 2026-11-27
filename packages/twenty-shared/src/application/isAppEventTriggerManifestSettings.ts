import { type AppEventTriggerManifestSettings } from '@/application/appEventTriggerManifestSettingsType';
import { type EventTriggerManifestSettings } from '@/application/eventTriggerManifestSettingsType';
import { type DatabaseEventTriggerSettings } from '@/application/logicFunctionManifestType';

export const isAppEventTriggerManifestSettings = (
  settings: EventTriggerManifestSettings | DatabaseEventTriggerSettings,
): settings is AppEventTriggerManifestSettings =>
  'on' in settings && settings.on === 'appEvent';
