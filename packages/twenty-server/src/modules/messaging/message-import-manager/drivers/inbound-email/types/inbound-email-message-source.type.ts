import { type INBOUND_EMAIL_MESSAGE_SOURCE } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/constants/inbound-email-message-source.constant';

export type InboundEmailMessageSource =
  (typeof INBOUND_EMAIL_MESSAGE_SOURCE)[keyof typeof INBOUND_EMAIL_MESSAGE_SOURCE];
