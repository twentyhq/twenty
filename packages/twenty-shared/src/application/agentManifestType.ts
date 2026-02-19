import { type AgentResponseSchema, type ModelConfiguration } from '@/ai';
import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

export type AgentTextResponseFormat = { type: 'text' };
export type AgentJsonResponseFormat = {
  type: 'json';
  schema: AgentResponseSchema;
};
export type AgentResponseFormatManifest =
  | AgentTextResponseFormat
  | AgentJsonResponseFormat;

export type AgentManifest = SyncableEntityOptions & {
  name: string;
  label: string;
  icon?: string;
  description?: string;
  prompt: string;
  modelId?: string;
  responseFormat?: AgentResponseFormatManifest;
  modelConfiguration?: ModelConfiguration;
  evaluationInputs?: string[];
};
