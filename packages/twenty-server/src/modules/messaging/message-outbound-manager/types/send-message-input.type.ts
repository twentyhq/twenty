type EmailAddress = string | string[];

export type SendMessageInput = {
  body: string;
  subject: string;
  to: EmailAddress;
  cc?: EmailAddress;
  bcc?: EmailAddress;
  html: string;
  attachments?: {
    filename: string;
    content: Buffer;
    contentType: string;
  }[];
};
