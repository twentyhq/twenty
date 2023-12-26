import { AddressObject, Attachment } from 'mailparser';

export type GmailMessage = {
  externalId: string;
  headerMessageId: string;
  subject: string;
  messageThreadId: string;
  internalDate: string;
  from: AddressObject | undefined;
  to: AddressObject | AddressObject[] | undefined;
  cc: AddressObject | AddressObject[] | undefined;
  bcc: AddressObject | AddressObject[] | undefined;
  text: string;
  html: string;
  attachments: Attachment[];
};
