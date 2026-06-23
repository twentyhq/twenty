import { type ServerWebhookTriggerSettings } from '@/application/serverWebhookTriggerSettingsType';
import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import { type ToolTriggerSettings } from '@/application/toolTriggerSettingsType';
import { type WorkflowActionTriggerSettings } from '@/application/workflowActionTriggerSettingsType';
import { type HTTPMethod } from '@/types';

export type LogicFunctionManifest = SyncableEntityOptions & {
  name?: string;
  description?: string;
  timeoutSeconds?: number;
  cronTriggerSettings?: CronTriggerSettings;
  databaseEventTriggerSettings?: DatabaseEventTriggerSettings;
  httpRouteTriggerSettings?: HttpRouteTriggerSettings;
  serverWebhookTriggerSettings?: ServerWebhookTriggerSettings;
  serverCronTriggerSettings?: ServerCronTriggerSettings;
  toolTriggerSettings?: ToolTriggerSettings;
  workflowActionTriggerSettings?: WorkflowActionTriggerSettings;
  sourceHandlerPath: string;
  builtHandlerPath: string;
  builtHandlerChecksum: string;
  handlerName: string;
};

export type CronTriggerSettings = {
  pattern: string;
};

export type ServerCronTriggerSettings = {
  pattern: string;
  targetLogicFunctionUniversalIdentifier: string;
};

export type DatabaseEventTriggerSettings = {
  eventName: string;
  updatedFields?: string[];
};

export type HttpRouteTriggerSettings = {
  path: string;
  httpMethod: HTTPMethod | `${HTTPMethod}`;
  isAuthRequired: boolean;
  forwardedRequestHeaders?: string[];
};
