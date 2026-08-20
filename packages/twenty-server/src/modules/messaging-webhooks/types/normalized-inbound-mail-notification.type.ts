import { type InboundEmailMessageReference } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/types/inbound-email-message-reference.type';

export type NormalizedInboundMailNotification = {
  recipients: string[];
  subject: string | null;
  message: InboundEmailMessageReference | null;
  dedupeKey: string;
};
