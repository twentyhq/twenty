import { type ProposedToolCall } from '@/ai/types/ProposedToolCall';

export type ProposeToolCallToolStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'failed'
  | 'conflict'
  | 'skipped';

export type ProposeToolCallToolResult = {
  status: ProposeToolCallToolStatus;
  proposal: ProposedToolCall;
  feedback?: string;
  error?: string;
  output?: unknown;
};
