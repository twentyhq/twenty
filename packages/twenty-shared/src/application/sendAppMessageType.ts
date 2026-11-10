export type SendAppMessageRecipient = {
  handle: string;
  displayName: string | null;
};

export type SendAppMessageAttachment = {
  filename: string;
  mimeType: string;
  size: number;
  // signed and short-lived: download it during the send, never store it
  url: string;
};

export type SendAppMessagePayload = {
  messagingProviderName: string;
  connectedAccountId: string;
  messageChannelId: string;
  threadExternalId: string;
  // empty when the message only carries attachments
  text: string;
  attachments?: SendAppMessageAttachment[];
  idempotencyKey: string;
  recipients: SendAppMessageRecipient[];
};

export type SendAppMessageResult = {
  externalId: string;
  sentAt?: string;
};
