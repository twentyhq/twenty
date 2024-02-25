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
  participants: Participant[];
  text: string;
  html: string;
  attachments: Attachment[];
};

export type Participant = {
  role: 'from' | 'to' | 'cc' | 'bcc';
  handle: string;
  displayName: string;
};

export type ParticipantWithId = Participant & {
  id: string;
};
