import { type ServerRouteTriggerSettings } from '@/application/serverRouteTriggerSettingsType';
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
  serverRouteTriggerSettings?: ServerRouteTriggerSettings;
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

export type DatabaseEventTriggerSettings = {
  eventName: string;
  updatedFields?: string[];
  // When set, the handler receives one job per chunk of events instead of one job per event
  batchSize?: number;
};

export type HttpRouteTriggerSettings = {
  path: string;
  httpMethod: HTTPMethod | `${HTTPMethod}`;
  isAuthRequired: boolean;
  forwardedRequestHeaders?: string[];
};
