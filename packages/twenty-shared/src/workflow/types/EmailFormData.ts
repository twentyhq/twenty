import { type EmailRecipients } from '@/workflow/types/EmailRecipients';
import { type WorkflowAttachment } from '@/workflow/types/WorkflowAttachment';

export type EmailFormData = {
  connectedAccountId: string;
  recipients: Required<EmailRecipients>;
  subject: string;
  body: string;
  files: WorkflowAttachment[];
};
