import { type AgentResponseSchema } from '@/ai/types/agent-response-schema.type';

export type AgentResponseFormatType = AgentResponseFormat['type'];

export type AgentTextResponseFormat = { type: 'text' };
export type AgentJsonResponseFormat = {
  type: 'json';
  schema: AgentResponseSchema;
};
export type AgentResponseFormat =
  | AgentTextResponseFormat
  | AgentJsonResponseFormat;
