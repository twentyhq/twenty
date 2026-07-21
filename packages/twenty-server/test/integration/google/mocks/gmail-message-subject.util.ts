import { type gmail_v1 } from 'googleapis';

export const getGmailMessageSubject = (
  message: gmail_v1.Schema$Message,
): string =>
  message.payload?.headers?.find((header) => header.name === 'Subject')
    ?.value ?? '';
