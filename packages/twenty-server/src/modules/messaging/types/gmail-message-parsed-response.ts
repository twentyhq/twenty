import { gmail_v1 } from 'googleapis';

export type GmailMessageParsedResponse = gmail_v1.Schema$Message & {
  error?: {
    code: number;
    message: string;
    status: string;
  };
};
