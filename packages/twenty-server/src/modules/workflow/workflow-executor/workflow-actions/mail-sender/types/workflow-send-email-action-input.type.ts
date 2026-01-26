import { type EmailRecipients } from 'twenty-shared/workflow';

export type WorkflowSendEmailActionInput = {
  connectedAccountId: string;
  email?: string;
  recipients?: EmailRecipients;
  subject?: string;
  body?: string;
};
