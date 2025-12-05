import { type HTTPMethod } from '@/types';

export type ServerlessFunctionManifest = {
  universalIdentifier: string;
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
  httpMethod: HTTPMethod;
  isAuthRequired: boolean;
};

export type ServerlessFunctionTriggerManifest = {
  universalIdentifier: string;
} & (CronTrigger | DatabaseEventTrigger | RouteTrigger);
