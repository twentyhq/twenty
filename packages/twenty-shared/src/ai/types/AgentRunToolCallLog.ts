import { type AgentRunSummary } from '@/ai/types/AgentRunSummary';

export type AgentRunToolCallLog = AgentRunSummary['toolCalls'][number];
