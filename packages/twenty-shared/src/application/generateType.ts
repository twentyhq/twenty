import { type AgentResponseFormat } from '@/ai/types/AgentResponseFormat';
import { type AiRunScope } from '@/ai/types/AiRunScope';

import { type RunAgentMessage } from './runAgentType';

export type GenerateInput = {
  input: string | RunAgentMessage[];
  instructions?: string;
  // the workspace default model when unset
  modelId?: string;
  responseFormat?: AgentResponseFormat;
  // no data tools when unset
  scope?: AiRunScope;
};

export type GenerateResult = {
  success: boolean;
  text: string | null;
  object: Record<string, unknown> | null;
  error: string | null;
  // the recorded turn, with its model, usage and credits; null when the call failed before it
  turnId: string | null;
  usage: { inputTokens: number; outputTokens: number } | null;
};
