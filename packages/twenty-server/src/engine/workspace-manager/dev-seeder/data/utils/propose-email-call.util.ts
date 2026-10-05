import { PROPOSE_TOOL_CALL_TOOL_NAME } from 'twenty-shared/ai';

import { buildSendEmailArguments } from 'src/engine/workspace-manager/dev-seeder/data/utils/build-send-email-arguments.util';
import { type SeededEmail } from 'src/engine/workspace-manager/dev-seeder/data/utils/seeded-email.type';
import { type SeededToolCall } from 'src/engine/workspace-manager/dev-seeder/data/utils/seeded-tool-call.type';

// without a resolver an email is the one call that can be proposed, as for any sender
export const proposeEmailCall = (email: SeededEmail): SeededToolCall => ({
  toolName: PROPOSE_TOOL_CALL_TOOL_NAME,
  input: {
    toolName: 'send_email',
    arguments: buildSendEmailArguments(email),
    summary: email.subject,
  },
});
