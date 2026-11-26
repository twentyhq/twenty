import { type SourceFileManifest } from '@/application/sourceFileManifestType';
import { type EventTriggerManifestSettings } from '@/application/eventTriggerManifestSettingsType';
import { type ServerRouteTriggerSettings } from '@/application/serverRouteTriggerSettingsType';
import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import { type ToolTriggerSettings } from '@/application/toolTriggerSettingsType';
import { type WorkflowActionTriggerSettings } from '@/application/workflowActionTriggerSettingsType';
import { type HTTPMethod, type ValidationRuleBindings } from '@/types';

export type LogicFunctionManifest = SyncableEntityOptions & {
  name?: string;
  description?: string;
  timeoutSeconds?: number;
  retryLimit?: number;
  jobFailureHandlerName?: string;
  cronTriggerSettings?: CronTriggerSettings;
  eventTriggerSettings?: EventTriggerManifestSettings;
  /** @deprecated Use `eventTriggerSettings` instead. */
  databaseEventTriggerSettings?: DatabaseEventTriggerSettings;
  httpRouteTriggerSettings?: HttpRouteTriggerSettings;
  serverRouteTriggerSettings?: ServerRouteTriggerSettings;
  toolTriggerSettings?: ToolTriggerSettings;
  workflowActionTriggerSettings?: WorkflowActionTriggerSettings;
  sourceHandlerPath: string;
  sourceFiles?: SourceFileManifest[];
  builtHandlerPath: string;
  builtHandlerChecksum: string;
  handlerName: string;
};

export type CronTriggerSettings = {
  pattern: string;
  spreadMs?: number;
};

export type DatabaseEventTriggerSettings = {
  eventName: string;
  updatedFields?: string[];
  batchMode?: boolean;
  condition?: string;
  conditionBindings?: ValidationRuleBindings;
};

export type HttpRouteTriggerSettings = {
  path: string;
  httpMethod: HTTPMethod;
  isAuthRequired: boolean;
  forwardedRequestHeaders?: string[];
};
