import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';

import { MailgunApiClientService } from 'src/engine/core-modules/emailing-domain/drivers/mailgun/services/mailgun-api-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { InboundEmailParserService } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/services/inbound-email-parser.service';
import { type InboundEmailMessageSourceInterface } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/sources/inbound-email-message-source.interface';
import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';

// Mailgun store() keeps the raw message in Mailgun storage; the reference
// is the retrieval URL from the notify payload and the MIME is fetched
// with the API credentials, then parsed like any other inbound message.
@Injectable()
export class MailgunInboundEmailMessageSourceService implements InboundEmailMessageSourceInterface {
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly mailgunApiClientService: MailgunApiClientService,
    private readonly inboundEmailParserService: InboundEmailParserService,
  ) {}

  isConfigured(): boolean {
    return isNonEmptyString(this.twentyConfigService.get('MAILGUN_API_KEY'));
  }

  async fetchMessage(reference: string): Promise<MessageWithParticipants> {
    const rawMessage =
      await this.mailgunApiClientService.fetchStoredMessageMime(reference);

    const { message } = await this.inboundEmailParserService.parse(
      rawMessage,
      reference,
    );

    return message;
  }

  async cleanup(reference: string): Promise<void> {
    await this.mailgunApiClientService.deleteStoredMessage(reference);
  }
}
