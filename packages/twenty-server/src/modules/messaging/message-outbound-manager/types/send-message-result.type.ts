export type SendMessageResult = {
  headerMessageId: string;
  messageExternalId?: string;
  threadExternalId?: string;
  deliveredRecipients?: { to: string[]; cc: string[]; bcc: string[] };
};
