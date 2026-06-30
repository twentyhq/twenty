import { type AgentResponseFormat } from '@/ai/types/agent-response-format.type';
import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

export type AgentManifest = SyncableEntityOptions & {
  name: string;
  label: string;
  icon?: string;
  description?: string;
  prompt: string;
  modelId?: string;
  responseFormat?: AgentResponseFormat;
};
