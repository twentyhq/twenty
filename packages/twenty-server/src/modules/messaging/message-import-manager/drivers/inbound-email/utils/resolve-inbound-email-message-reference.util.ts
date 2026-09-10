import { INBOUND_EMAIL_MESSAGE_SOURCE } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/constants/inbound-email-message-source.constant';
import { type InboundEmailMessageReference } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/types/inbound-email-message-reference.type';
import { type MessagingInboundEmailImportJobData } from 'src/modules/messaging/message-import-manager/jobs/messaging-inbound-email-import.job';

export const resolveInboundEmailMessageReference = (
  data: MessagingInboundEmailImportJobData,
): InboundEmailMessageReference => {
  if ('s3Key' in data) {
    return {
      source: INBOUND_EMAIL_MESSAGE_SOURCE.SES_S3,
      reference: data.s3Key,
    };
  }

  return { source: data.source, reference: data.reference };
};
