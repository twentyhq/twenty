export type GmailApiBatchError = {
  code: number;
  errors: {
    reason: string;
    message: string;
  }[];
};
