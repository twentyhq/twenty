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
  triggers: LogicFunctionTriggerManifest[];
  sourceHandlerPath: string;
  builtHandlerPath: string;
  builtHandlerChecksum: string | null;
  handlerName: string;
  toolInputSchema?: InputJsonSchema;
  isTool?: boolean;
};

export type DatabaseEventTrigger = {
  type: 'databaseEvent';
  eventName: string;
  updatedFields?: string[];
};

export type CronTrigger = {
  type: 'cron';
  pattern: string;
};

export type RouteTrigger = {
  type: 'route';
  path: string;
  httpMethod: `${HTTPMethod}`;
  isAuthRequired: boolean;
  forwardedRequestHeaders?: string[];
};

export type LogicFunctionTriggerManifest = SyncableEntityOptions &
  (CronTrigger | DatabaseEventTrigger | RouteTrigger);
