import {
  type ProposeToolCallToolResult,
  type ProposedToolCall,
} from 'twenty-shared/ai';

export const buildProposeToolCallPendingOutput = (
  proposal: ProposedToolCall,
): {
  success: true;
  message: string;
  result: ProposeToolCallToolResult;
} => ({
  success: true,
  message: 'Tool call proposed to the user; awaiting their decision.',
  result: { status: 'pending', proposal },
});
