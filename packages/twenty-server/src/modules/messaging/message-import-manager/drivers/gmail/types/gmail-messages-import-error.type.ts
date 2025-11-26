export type GmailMessagesImportError = {
  code?: string;
  errors: {
    reason: string;
    message: string;
  }[];
};
