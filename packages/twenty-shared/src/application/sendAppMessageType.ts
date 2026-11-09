import { type MessagingProviderConversationStyle } from './messagingProviderConversationStyleType';

export type SendAppMessageRecipient = {
  handle: string;
  displayName: string | null;
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
  text: string;
  idempotencyKey: string;
  // the To recipients: the conversation's latest participants, or the ones picked in the email composer
  recipients: SendAppMessageRecipient[];
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
