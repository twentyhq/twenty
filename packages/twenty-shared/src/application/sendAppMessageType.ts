export type SendAppMessageRecipient = {
  handle: string;
  displayName: string | null;
};

export type SendAppMessagePayload = {
  messagingProviderName: string;
  connectedAccountId: string;
  messageChannelId: string;
  threadExternalId: string;
  text: string;
  idempotencyKey: string;
  recipients: SendAppMessageRecipient[];
};

export type SendAppMessageResult = {
  externalId: string;
  sentAt?: string;
};
