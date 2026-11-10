export type SendAppMessageRecipient = {
  handle: string;
  displayName: string | null;
};

export type SendAppMessageAttachment = {
  filename: string;
  mimeType: string;
  size: number;
  // short-lived signed URL the logic function downloads the file from
  url: string;
};

export type SendAppMessagePayload = {
  messagingProviderName: string;
  connectedAccountId: string;
  messageChannelId: string;
  threadExternalId: string;
  attachments: SendAppMessageAttachment[];
  text: string;
  idempotencyKey: string;
  recipients: SendAppMessageRecipient[];
};

export type SendAppMessageResult = {
  externalId: string;
  sentAt?: string;
};
