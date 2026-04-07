import { type DataMessagePart } from '@/ai/types/DataMessagePart';
import { type Nullable } from '@/types';
import { type UIMessage } from 'ai';

export type AIChatUsageMetadata = {
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens: number;
  inputCredits: number;
  outputCredits: number;
  conversationSize: number;
};

export type AIChatModelMetadata = {
  contextWindowTokens: number;
};

type Metadata = {
  createdAt: string;
  usage?: AIChatUsageMetadata;
  model?: AIChatModelMetadata;
};

export type ExtendedUIMessage = UIMessage<Metadata, DataMessagePart> & {
  threadId?: Nullable<string>;
  status?: 'queued' | 'sent';
};
