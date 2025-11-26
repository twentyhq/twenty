export type GmailMessageListFetchError = {
  code?: string;
  errors: {
    reason: string;
    message: string;
  }[];
};
