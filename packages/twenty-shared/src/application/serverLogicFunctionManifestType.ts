import {
  type LogicFunctionManifest,
  type ServerCronTriggerSettings,
} from '@/application/logicFunctionManifestType';
import { type ServerWebhookTriggerSettings } from '@/application/serverWebhookTriggerSettingsType';

export type ServerLogicFunctionManifest = LogicFunctionManifest & {
  serverWebhookTriggerSettings?: ServerWebhookTriggerSettings;
  serverCronTriggerSettings?: ServerCronTriggerSettings;
};
