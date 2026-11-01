import { type AgentResponseFormat } from '@/ai/types/AgentResponseFormat';
import { type ModelConfiguration } from '@/ai/types/ModelConfiguration';
import { type AgentTriggerManifest } from '@/application/agentTriggerType';
import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

export type AgentManifest = SyncableEntityOptions & {
  name: string;
  label: string;
  icon?: string;
  description?: string;
  prompt: string;
  modelId?: string;
  responseFormat?: AgentResponseFormat;
  modelConfiguration?: ModelConfiguration;
  isSystem?: boolean;
  roleUniversalIdentifier?: string;
  triggers?: AgentTriggerManifest[];
};
