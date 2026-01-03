import { type HTTPMethod } from '@/types';
import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

export type ToolSchemaPropertyType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array';

export type ToolSchemaProperty = {
  type: ToolSchemaPropertyType;
  description?: string;
  enum?: string[];
  items?: ToolSchemaProperty;
  properties?: Record<string, ToolSchemaProperty>;
};

export type ServerlessFunctionManifest = SyncableEntityOptions & {
  name?: string;
  description?: string;
  timeoutSeconds?: number;
  triggers: ServerlessFunctionTriggerManifest[];
  handlerPath: string;
  handlerName: string;
  toolDescription?: string;
  toolInputSchema?: ToolSchemaProperty;
  toolOutputSchema?: ToolSchemaProperty;
};

export type DatabaseEventTrigger = {
  type: 'databaseEvent';
  eventName: string;
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
};

export type ServerlessFunctionTriggerManifest = SyncableEntityOptions &
  (CronTrigger | DatabaseEventTrigger | RouteTrigger);
