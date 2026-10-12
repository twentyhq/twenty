import { type AgentResponseFormat } from '@/ai/types/AgentResponseFormat';
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
  roleUniversalIdentifier?: string;
  triggers?: AgentTriggerManifest[];
};
