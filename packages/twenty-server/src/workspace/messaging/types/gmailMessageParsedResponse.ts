export type GmailMessageParsedResponse = {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  sizeEstimate: number;
  raw: string;
  historyId: string;
  internalDate: string;
  error?: {
    code: number;
    message: string;
    status: string;
  };
};
