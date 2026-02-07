import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import { type HTTPMethod } from '@/types';

// Standard JSON Schema type for tool input/output definitions
export type InputJsonSchema = {
  type?:
    | 'string'
    | 'number'
    | 'boolean'
    | 'object'
    | 'array'
    | 'integer'
    | 'null';
  description?: string;
  enum?: unknown[];
  items?: InputJsonSchema;
  properties?: Record<string, InputJsonSchema>;
  required?: string[];
  additionalProperties?: boolean | InputJsonSchema;
};

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
  toolInputSchema?: InputJsonSchema;
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
