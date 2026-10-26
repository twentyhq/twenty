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
  // Same across retries of one reply; forward it to the provider when it supports idempotent sends.
  idempotencyKey: string;
  // Everyone in the conversation other than the channel's own handle.
  recipients: SendAppMessageRecipient[];
};

export type SendAppMessageResult = {
  // The provider's id for the sent message; ingesting it again later is a no-op.
  externalId: string;
  // ISO 8601; defaults to when the send returned.
  sentAt?: string;
};
