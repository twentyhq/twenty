export type GmailFoldersError = {
  code?: string;
  errors: {
    reason: string;
    message: string;
  }[];
};
