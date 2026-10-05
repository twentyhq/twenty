import {
  PROPOSE_TOOL_CALL_TOOL_NAME,
  type ProposedToolCall,
} from 'twenty-shared/ai';

import { type SeededToolCall } from 'src/engine/workspace-manager/dev-seeder/data/utils/seeded-tool-call.type';

// mirrors what resolveProposedToolCall builds, so the cards render as they would for a live agent
export const proposeRecordCall = (
  proposal: Omit<ProposedToolCall, 'alternativeToolNames'>,
): SeededToolCall => ({
  toolName: PROPOSE_TOOL_CALL_TOOL_NAME,
  input: {
    toolName: proposal.toolName,
    arguments: proposal.arguments,
    summary: proposal.summary,
  },
  context: { resolveProposal: async () => ({ proposal }) },
});
