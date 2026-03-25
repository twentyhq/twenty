import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import { type HTTPMethod } from '@/types';
import { type InputJsonSchema } from '@/logic-function/input-json-schema.type';

export type LogicFunctionManifest = SyncableEntityOptions & {
  name?: string;
  description?: string;
  timeoutSeconds?: number;
  cronTriggerSettings?: CronTriggerSettings;
  databaseEventTriggerSettings?: DatabaseEventTriggerSettings;
  httpRouteTriggerSettings?: HttpRouteTriggerSettings;
  sourceHandlerPath: string;
  builtHandlerPath: string;
  builtHandlerChecksum: string;
  handlerName: string;
  toolInputSchema: InputJsonSchema;
  isTool?: boolean;
};

export type CronTriggerSettings = {
  pattern: string;
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
