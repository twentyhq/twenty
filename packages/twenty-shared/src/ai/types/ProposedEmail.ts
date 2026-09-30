import { type EmailRecipients } from '@/workflow/types/EmailRecipients';

// An email as an agent proposes it and as a person edits it before sending:
// recipients are comma-separated, the body is plain text.
export type ProposedEmail = {
  recipients: Required<EmailRecipients>;
  subject: string;
  body: string;
  connectedAccountId?: string;
};
