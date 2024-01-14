import { Attachment } from 'mailparser';

export type GmailMessage = {
  historyId: string;
  externalId: string;
  headerMessageId: string;
  subject: string;
  messageThreadExternalId: string;
  internalDate: string;
  fromHandle: string;
  fromDisplayName: string;
  recipients: Recipient[];
  text: string;
  html: string;
  attachments: Attachment[];
};

export type Recipient = {
  role: 'from' | 'to' | 'cc' | 'bcc';
  handle: string;
  displayName: string;
};
