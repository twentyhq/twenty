export type SendAppMessageRecipient = {
  handle: string;
  displayName: string | null;
};

// Set when the reply is written in the email layout (provider conversationStyle 'email')
export type SendAppMessageEmail = {
  subject: string;
  html: string;
  cc: SendAppMessageRecipient[];
  bcc: SendAppMessageRecipient[];
  // externalId of the message being replied to, when Twenty knows it
  inReplyToExternalId: string | null;
};

export type SendAppMessagePayload = {
  messagingProviderName: string;
  connectedAccountId: string;
  messageChannelId: string;
  threadExternalId: string;
  text: string;
  idempotencyKey: string;
  // the To recipients: the conversation's latest participants, or the ones picked in the email layout
  recipients: SendAppMessageRecipient[];
  email?: SendAppMessageEmail;
};

export type SendAppMessageResult = {
  externalId: string;
  sentAt?: string;
};
