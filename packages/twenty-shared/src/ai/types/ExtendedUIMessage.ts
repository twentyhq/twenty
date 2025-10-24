import { type DataMessagePart } from '@/ai/types/DataMessagePart';
import { type UIMessage } from 'ai';

type Metadata = {
  createdAt: string;
};

export type ExtendedUIMessage = UIMessage<Metadata, DataMessagePart>;
