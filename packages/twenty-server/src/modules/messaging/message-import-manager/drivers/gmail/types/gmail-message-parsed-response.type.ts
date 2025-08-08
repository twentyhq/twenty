import { type gmail_v1 } from 'googleapis';

type GmailMessageError = {
  error: {
    code: number;
    message: string;
    status: string;
  };
};

export type GmailMessageParsedResponse =
  | gmail_v1.Schema$Message
  | GmailMessageError;
