export interface ImapConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass?: string;
    accessToken?: string;
  };
}

export interface ImapMessage {
  uid: number;
  messageId: string;
  subject: string;
  from: { name?: string; address: string }[];
  to: { name?: string; address: string }[];
  cc?: { name?: string; address: string }[];
  bcc?: { name?: string; address: string }[];
  date: Date;
  text?: string;
  html?: string;
  attachments?: ImapAttachment[];
  flags: string[];
  seen: boolean;
}

export interface ImapAttachment {
  filename: string;
  contentType: string;
  size: number;
  content: Buffer;
}

export interface ImapFolder {
  path: string;
  name: string;
  delimiter: string;
  flags: string[];
  specialUse?: string;
}

export interface SyncOptions {
  batchSize?: number;
  since?: Date;
  fullSync?: boolean;
}
