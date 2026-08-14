import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';

import { ResendApiClientService } from 'src/engine/core-modules/emailing-domain/drivers/resend/services/resend-api-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { InboundEmailParserService } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/services/inbound-email-parser.service';
import { type InboundEmailMessageSourceInterface } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/sources/inbound-email-message-source.interface';
import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';

// Resend stores received emails on their side; the reference is the received
// email id from the email.received webhook, and the raw MIME is fetched
// through a pre-signed download URL.
@Injectable()
export class ResendInboundEmailMessageSourceService implements InboundEmailMessageSourceInterface {
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly resendApiClientService: ResendApiClientService,
    private readonly inboundEmailParserService: InboundEmailParserService,
  ) {}

  isConfigured(): boolean {
    return isNonEmptyString(this.twentyConfigService.get('RESEND_API_KEY'));
  }

  async fetchMessage(reference: string): Promise<MessageWithParticipants> {
    const receivedEmail =
      await this.resendApiClientService.getReceivedEmail(reference);

    const downloadUrl = receivedEmail.raw?.download_url;

    if (!isNonEmptyString(downloadUrl)) {
      throw new Error(
        `Received email ${reference} has no raw content download URL`,
      );
    }

    const rawMessage =
      await this.resendApiClientService.downloadRawEmail(downloadUrl);

    const { message } = await this.inboundEmailParserService.parse(
      rawMessage,
      reference,
    );

    return message;
  }

  async cleanup(_reference: string): Promise<void> {
    // Resend retains received emails on their side; nothing to delete
  }
}
