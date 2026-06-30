import { type EmailAttachment } from 'twenty-shared/types';
import { type EmailRecipients } from 'twenty-shared/workflow';

export type WorkflowSendEmailActionInput = {
  connectedAccountId: string;
  recipients: EmailRecipients;
  subject?: string;
  body?: string;
  files?: EmailAttachment[];
  inReplyTo?: string;
};
