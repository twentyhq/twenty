import { type ProposeToolCallToolStatus } from '@/ai/types/ProposeToolCallToolStatus';
import { type ProposedToolCall } from '@/ai/types/ProposedToolCall';

export type ProposeToolCallToolResult = {
  status: ProposeToolCallToolStatus;
  proposal: ProposedToolCall;
  feedback?: string;
  error?: string;
  output?: unknown;
};
