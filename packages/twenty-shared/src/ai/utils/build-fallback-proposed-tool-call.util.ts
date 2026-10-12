import { type ProposeToolCallToolInput } from '@/ai/types/ProposeToolCallToolInput';
import { type ProposedToolCall } from '@/ai/types/ProposedToolCall';

// a call whose resolved proposal is missing is shown and answered as a generic one
export const buildFallbackProposedToolCall = ({
  toolName,
  summary,
  arguments: toolArguments,
}: ProposeToolCallToolInput): ProposedToolCall => ({
  toolName,
  toolLabel: toolName,
  summary,
  arguments: toolArguments,
  template: 'generic',
});
