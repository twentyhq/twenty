import { type ProposeToolCallToolInput } from 'twenty-shared/ai';

import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type ProposedToolCallResolution } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/proposed-tool-call-resolution.type';
import { proposeToolCallInputSchema } from 'src/engine/metadata-modules/ai/ai-chat/tools/propose-tool-call-input.schema';
import { buildProposeToolCallPendingOutput } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-propose-tool-call-pending-output.util';

export const createProposeToolCallTool = ({
  resolveProposal,
}: {
  resolveProposal: (
    input: ProposeToolCallToolInput,
  ) => Promise<ProposedToolCallResolution>;
}) => ({
  description:
    'Propose a tool call for a person to approve before it runs, instead of calling the tool yourself. ' +
    'Most calls need no approval: use this only when the action is hard to undo or reaches people outside ' +
    'the workspace, when you are unsure it matches what the person wants, or when your instructions ask ' +
    'for approval. Never use it for reads. The conversation pauses until the person approves it, possibly ' +
    'after editing the arguments, or rejects it with optional feedback. You then get the tool result or ' +
    'their feedback. Propose one call at a time. To have an email reviewed before it goes out, propose ' +
    'send_email or draft_email with the arguments you would send it with: the person can edit it, ' +
    'send it, save it as a draft or discard it.',
  inputSchema: proposeToolCallInputSchema,
  execute: async (
    input: ProposeToolCallToolInput,
  ): Promise<
    ReturnType<typeof buildProposeToolCallPendingOutput> | ToolOutput
  > => {
    const resolution = await resolveProposal(input);

    return 'error' in resolution
      ? {
          success: false,
          message: 'The tool call could not be proposed',
          error: resolution.error,
        }
      : buildProposeToolCallPendingOutput(resolution.proposal);
  },
});
