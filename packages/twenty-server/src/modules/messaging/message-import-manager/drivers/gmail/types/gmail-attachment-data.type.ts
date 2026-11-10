import { type MessageAttachmentMetadata } from 'src/modules/messaging/message-import-manager/types/message.type';

export type GmailAttachmentData = MessageAttachmentMetadata & {
  attachmentId: string;
};
