import { type DataMessagePart } from '@/ai/types/DataMessagePart';
import { type UIMessagePart, type UITools } from 'ai';

export type ExtendedUIMessagePart = UIMessagePart<DataMessagePart, UITools>;
