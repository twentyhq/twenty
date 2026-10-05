import {
  type CronTriggerSettings,
  type DatabaseEventTriggerSettings,
} from '@/application/logicFunctionManifestType';

export const AGENT_TRIGGER_TYPES = ['DATABASE_EVENT', 'CRON'] as const;

export type AgentTriggerType = (typeof AGENT_TRIGGER_TYPES)[number];

type AgentTriggerBase = {
  // Stays the same across edits so cron deduplication and run threads keep keying on it
  id: string;
  isActive: boolean;
  instructions: string | null;
};

export type AgentDatabaseEventTrigger = AgentTriggerBase & {
  type: 'DATABASE_EVENT';
  settings: DatabaseEventTriggerSettings;
};

export type AgentCronTrigger = AgentTriggerBase & {
  type: 'CRON';
  settings: CronTriggerSettings;
};

export type AgentTrigger = AgentDatabaseEventTrigger | AgentCronTrigger;

type AgentTriggerManifestBase = {
  universalIdentifier: string;
  isActive?: boolean;
  instructions?: string;
};

export type AgentTriggerManifest =
  | (AgentTriggerManifestBase & {
      type: 'DATABASE_EVENT';
      settings: DatabaseEventTriggerSettings;
    })
  | (AgentTriggerManifestBase & {
      type: 'CRON';
      settings: CronTriggerSettings;
    });
