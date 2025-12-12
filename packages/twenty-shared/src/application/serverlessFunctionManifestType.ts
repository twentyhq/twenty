import { type HTTPMethod } from '@/types';
import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

export type ServerlessFunctionManifest = SyncableEntityOptions & {
  name?: string;
  description?: string;
  timeoutSeconds?: number;
  triggers: ServerlessFunctionTriggerManifest[];
  handlerPath: string;
  handlerName: string;
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
