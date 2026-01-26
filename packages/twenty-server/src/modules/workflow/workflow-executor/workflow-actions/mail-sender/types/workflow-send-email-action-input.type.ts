export type EmailRecipients = {
  to: string;
  cc?: string;
  bcc?: string;
};

export type WorkflowSendEmailActionInput = {
  connectedAccountId: string;
  email?: string;
  recipients?: EmailRecipients;
  subject?: string;
  body?: string;
};
