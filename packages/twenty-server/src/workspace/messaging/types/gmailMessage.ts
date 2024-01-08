import { AddressObject, Attachment } from 'mailparser';

export type GmailMessage = {
  externalId: string;
  headerMessageId: string;
  subject: string;
  messageThreadId: string;
  internalDate: string;
  from: AddressObject;
  to: AddressObject[];
  cc?: AddressObject[];
  bcc?: AddressObject[];
  text: string;
  html: string;
  attachments: Attachment[];
};
