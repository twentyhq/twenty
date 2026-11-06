export type StartAppConversationRecipient = {
  personId: string;
  displayName: string | null;
  // set when Twenty already knows the person's handle on this channel, otherwise the app resolves it
  handle: string | null;
};

export type StartAppConversationPayload = {
  messagingProviderName: string;
  connectedAccountId: string;
  messageChannelId: string;
  text: string;
  idempotencyKey: string;
  recipients: StartAppConversationRecipient[];
};

export type StartAppConversationResultRecipient = {
  personId: string;
  handle: string;
};

export type StartAppConversationResult = {
  externalId: string;
  threadExternalId: string;
  sentAt?: string;
  recipients?: StartAppConversationResultRecipient[];
};
