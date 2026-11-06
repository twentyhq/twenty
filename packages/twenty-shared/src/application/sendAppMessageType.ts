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

export type SendAppMessagePayload = {
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

export type SendAppMessageResult = {
  externalId: string;
  sentAt?: string;
};
