import {
  type ProposeToolCallToolInput,
  type ProposedEmail,
  type ProposedToolCall,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { convertPlainTextToEmailDocument } from 'src/engine/metadata-modules/ai/ai-chat/utils/convert-plain-text-to-email-document.util';

// an email posted in the plain-text propose_email shape becomes a send_email proposal,
// reviewed on the same card as one an agent proposes
export const buildEmailToolCallProposal = (
  email: ProposedEmail,
): { input: ProposeToolCallToolInput; proposal: ProposedToolCall } => {
  const input: ProposeToolCallToolInput = {
    toolName: 'send_email',
    arguments: {
      recipients: email.recipients,
      subject: email.subject,
      body: convertPlainTextToEmailDocument(email.body),
      ...(isDefined(email.connectedAccountId)
        ? { connectedAccountId: email.connectedAccountId }
        : {}),
    },
    summary: email.subject,
  };

  return {
    input,
    proposal: {
      ...input,
      toolLabel: 'Send email',
      template: 'email',
      alternativeToolNames: ['draft_email'],
    },
  };
};
