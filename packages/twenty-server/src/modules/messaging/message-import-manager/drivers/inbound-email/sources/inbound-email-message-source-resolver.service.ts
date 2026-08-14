import { Injectable } from '@nestjs/common';

import { type InboundEmailMessageSourceInterface } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/sources/inbound-email-message-source.interface';
import { MailgunInboundEmailMessageSourceService } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/sources/mailgun-inbound-email-message-source.service';
import { ResendInboundEmailMessageSourceService } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/sources/resend-inbound-email-message-source.service';
import { SesS3InboundEmailMessageSourceService } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/sources/ses-s3-inbound-email-message-source.service';
import { INBOUND_EMAIL_MESSAGE_SOURCE } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/constants/inbound-email-message-source.constant';
import { type InboundEmailMessageSource } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/types/inbound-email-message-source.type';

@Injectable()
export class InboundEmailMessageSourceResolverService {
  constructor(
    private readonly sesS3InboundEmailMessageSourceService: SesS3InboundEmailMessageSourceService,
    private readonly resendInboundEmailMessageSourceService: ResendInboundEmailMessageSourceService,
    private readonly mailgunInboundEmailMessageSourceService: MailgunInboundEmailMessageSourceService,
  ) {}

  resolve(
    source: InboundEmailMessageSource,
  ): InboundEmailMessageSourceInterface {
    switch (source) {
      case INBOUND_EMAIL_MESSAGE_SOURCE.SES_S3:
        return this.sesS3InboundEmailMessageSourceService;
      case INBOUND_EMAIL_MESSAGE_SOURCE.RESEND:
        return this.resendInboundEmailMessageSourceService;
      case INBOUND_EMAIL_MESSAGE_SOURCE.MAILGUN:
        return this.mailgunInboundEmailMessageSourceService;
      default:
        throw new Error(`Unsupported inbound email message source: ${source}`);
    }
  }
}
