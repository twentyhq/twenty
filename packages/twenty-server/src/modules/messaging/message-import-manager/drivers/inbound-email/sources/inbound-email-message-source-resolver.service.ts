import { Injectable } from '@nestjs/common';

import { type InboundEmailMessageSourceInterface } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/sources/inbound-email-message-source.interface';
import { SesS3InboundEmailMessageSourceService } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/sources/ses-s3-inbound-email-message-source.service';
import { INBOUND_EMAIL_MESSAGE_SOURCE } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/constants/inbound-email-message-source.constant';
import { type InboundEmailMessageSource } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/types/inbound-email-message-source.type';

@Injectable()
export class InboundEmailMessageSourceResolverService {
  constructor(
    private readonly sesS3InboundEmailMessageSourceService: SesS3InboundEmailMessageSourceService,
  ) {}

  resolve(
    source: InboundEmailMessageSource,
  ): InboundEmailMessageSourceInterface {
    switch (source) {
      case INBOUND_EMAIL_MESSAGE_SOURCE.SES_S3:
        return this.sesS3InboundEmailMessageSourceService;
      default:
        throw new Error(`Unsupported inbound email message source: ${source}`);
    }
  }
}
