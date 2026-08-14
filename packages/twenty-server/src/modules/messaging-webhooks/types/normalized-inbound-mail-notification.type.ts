import { type InboundEmailMessageReference } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/types/inbound-email-message-source.type';

export type NormalizedInboundMailNotification = {
  recipients: string[];
  subject: string | null;
  // null when the provider notification carries no retrievable message content
  message: InboundEmailMessageReference | null;
  // provider-unique id used to deduplicate import jobs across webhook retries
  dedupeKey: string;
};
