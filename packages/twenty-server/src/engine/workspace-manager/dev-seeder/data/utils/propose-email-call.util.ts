import {
  PROPOSE_TOOL_CALL_TOOL_NAME,
  type ProposeToolCallToolInput,
} from 'twenty-shared/ai';

import { resolveEmailToolCallProposal } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/resolve-email-tool-call-proposal.util';
import { buildProposeToolCallPendingOutput } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/propose-tool-call.pausing-tool';
import { buildSendEmailArguments } from 'src/engine/workspace-manager/dev-seeder/data/utils/build-send-email-arguments.util';
import { type SeededEmail } from 'src/engine/workspace-manager/dev-seeder/data/utils/seeded-email.type';
import { type SeededToolCall } from 'src/engine/workspace-manager/dev-seeder/data/utils/seeded-tool-call.type';

export const proposeEmailCall = (email: SeededEmail): SeededToolCall => {
  const input: ProposeToolCallToolInput = {
    toolName: 'send_email',
    arguments: buildSendEmailArguments(email),
    summary: email.subject,
  };
  const resolution = resolveEmailToolCallProposal(input);

  if ('error' in resolution) {
    throw new Error(`Seeded email does not resolve: ${resolution.error}`);
  }

  return {
    toolName: PROPOSE_TOOL_CALL_TOOL_NAME,
    input,
    buildPendingOutput: async () =>
      buildProposeToolCallPendingOutput(resolution.proposal),
  };
};
