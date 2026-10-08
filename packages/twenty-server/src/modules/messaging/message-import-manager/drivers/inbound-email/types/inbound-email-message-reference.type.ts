import { type InboundEmailMessageSource } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/types/inbound-email-message-source.type';

export type InboundEmailMessageReference = {
  source: InboundEmailMessageSource;
  reference: string;
};
