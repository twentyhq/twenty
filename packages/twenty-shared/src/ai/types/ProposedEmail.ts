import { type EmailRecipients } from '@/workflow/types/EmailRecipients';

// Recipients are comma-separated; the body is plain text.
export type ProposedEmail = {
  recipients: Required<EmailRecipients>;
  subject: string;
  body: string;
  connectedAccountId?: string;
};
