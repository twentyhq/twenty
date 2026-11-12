import { type MessagingProviderConversationStyle } from './messagingProviderConversationStyleType';

export type SendAppMessageRecipient = {
  handle: string;
  displayName: string | null;
};

export type SendAppMessageAttachment = {
  filename: string;
  contentType: string;
  size: number;
  // short-lived signed URL, so file bytes never travel in the logic function payload
  downloadUrl: string;
};

export type SendAppMessageEmail = {
  subject: string;
  html: string;
  cc: SendAppMessageRecipient[];
  bcc: SendAppMessageRecipient[];
  inReplyToExternalId: string | null;
};

type SendAppMessagePayloadBase = {
  messagingProviderName: string;
  connectedAccountId: string;
  messageChannelId: string;
  threadExternalId: string;
  // empty when the message only carries attachments
  text: string;
  idempotencyKey: string;
  recipients: SendAppMessageRecipient[];
  attachments: SendAppMessageAttachment[];
};

export type SendAppMessagePayload =
  | (SendAppMessagePayloadBase & {
      conversationStyle: Extract<MessagingProviderConversationStyle, 'chat'>;
    })
  | (SendAppMessagePayloadBase & {
      conversationStyle: Extract<MessagingProviderConversationStyle, 'email'>;
      email: SendAppMessageEmail;
    });

export type SendAppMessageResult = {
  externalId: string;
  sentAt?: string;
};
