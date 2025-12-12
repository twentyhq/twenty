import { type DataMessagePart } from '@/ai/types/DataMessagePart';
import { type UIMessage } from 'ai';

export type AIChatUsageMetadata = {
  inputTokens: number;
  outputTokens: number;
  inputCredits: number;
  outputCredits: number;
};

export type AIChatModelMetadata = {
  contextWindowTokens: number;
};

type Metadata = {
  createdAt: string;
  usage?: AIChatUsageMetadata;
  model?: AIChatModelMetadata;
};

export type ExtendedUIMessage = UIMessage<Metadata, DataMessagePart>;
