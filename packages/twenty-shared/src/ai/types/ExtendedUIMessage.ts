import { type DataMessagePart } from '@/ai/types/DataMessagePart';
import { type UIMessage } from 'ai';

export type AIChatUsageMetadata = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
};

export type AIChatModelMetadata = {
  modelId: string;
  contextWindowTokens: number;
  inputCostPer1kTokensInCents: number;
  outputCostPer1kTokensInCents: number;
};

type Metadata = {
  createdAt: string;
  usage?: AIChatUsageMetadata;
  model?: AIChatModelMetadata;
};

export type ExtendedUIMessage = UIMessage<Metadata, DataMessagePart>;
