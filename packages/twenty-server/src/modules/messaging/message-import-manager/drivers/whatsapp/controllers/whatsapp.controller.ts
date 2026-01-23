import {
  Body,
  Controller,
  Get,
  Headers,
  HttpStatus,
  Injectable,
  Logger,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { Response } from 'express';

import { WhatsAppWebhookMessage } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/types/whatsapp-webhook-message.type';
import { validateWebhookPayload } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/utils/validate-webhook-payload.util';
import { IntegrationsEntity } from 'src/engine/metadata-modules/integrations/integrations.entity';
import { WhatsappWebhookHistory } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/types/whatsapp-webhook-history.type';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  WhatsappParseWebhookMessageJob,
  WhatsappParseWebhookMessageJobData,
} from 'src/modules/messaging/message-import-manager/drivers/whatsapp/jobs/whatsapp-parse-webhook-message.job';
import { WhatsappRetrieveAppSecretService } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/services/whatsapp-retrieve-app-secret.service';
import { RequireFeatureFlag } from 'src/engine/guards/feature-flag.guard';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

@Injectable()
@Controller('whatsapp')
export class WhatsappController {
  private readonly logger = new Logger('WhatsappController');
  constructor(
    @InjectMessageQueue(MessageQueue.parseMessageQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly whatsappRetrieveSecret: WhatsappRetrieveAppSecretService,
    @InjectRepository(IntegrationsEntity)
    private readonly integrationsRepository: Repository<IntegrationsEntity>,
  ) {}

  // reference: https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/create-webhook-endpoint#get-requests
  // eslint-disable-next-line @nx/workspace-rest-api-methods-should-be-guarded
  @RequireFeatureFlag(FeatureFlagKey.IS_WHATSAPP_INTEGRATION_ENABLED)
  @Get('/webhook')
  public async whatsappVerification(
    @Query('hub.mode') mode: string,
    @Query('hub.challenge') challenge: string,
    @Query('hub.verify_token') token: string,
    @Res() res: Response,
  ) {
    if (mode !== 'subscribe') {
      res.status(HttpStatus.BAD_REQUEST).send();
      this.logger.error('WhatsApp webhook verification failed - wrong request');

      return null;
    }

    const whatsapp = await this.integrationsRepository.findOneBy({
      whatsappWebhookToken: token,
    });

    if (whatsapp !== null) {
      res.status(HttpStatus.OK).send(challenge);
    } else {
      res.status(HttpStatus.BAD_REQUEST).send();
      this.logger.error(
        'WhatsApp webhook verification failed - invalid stored token',
      );
    }
  }

  // TODO: add custom logic guard checking if request is from legitimate IP address (or maybe better to implement mTLS?)
  // eslint-disable-next-line @nx/workspace-rest-api-methods-should-be-guarded
  @RequireFeatureFlag(FeatureFlagKey.IS_WHATSAPP_INTEGRATION_ENABLED)
  @Post('/webhook') // unless integration is done by BSP, all webhooks are sent to the same destination
  public async getMessages(
    @Headers('x-hub-signature-256') signature: string,
    @Body() body: WhatsAppWebhookMessage,
    @Res() res: Response,
  ) {
    const appSecret = await this.whatsappRetrieveSecret.retrieveAppSecret(
      body.entry[0].id,
    );

    if (
      appSecret === null ||
      !validateWebhookPayload(signature, JSON.stringify(body), appSecret)
    ) {
      res.status(HttpStatus.BAD_REQUEST).send();
      this.logger.error('Invalid WhatsApp webhook message');

      return null;
    }
    res.status(HttpStatus.OK).send();
    await this.messageQueueService.add<WhatsappParseWebhookMessageJobData>(
      WhatsappParseWebhookMessageJob.name,
      {
        dataType: 'message',
        data: body,
      },
    );
  }

  // eslint-disable-next-line @nx/workspace-rest-api-methods-should-be-guarded
  @RequireFeatureFlag(FeatureFlagKey.IS_WHATSAPP_INTEGRATION_ENABLED)
  @Post('/history') // unused, in case integration is done by BSP
  public async getHistory(
    @Headers('x-hub-signature-256') signature: string,
    @Body() body: WhatsappWebhookHistory,
    @Res() res: Response,
  ) {
    const appSecret = await this.whatsappRetrieveSecret.retrieveAppSecret(
      body.entry[0].id,
    );

    if (
      appSecret === null ||
      !validateWebhookPayload(signature, JSON.stringify(body), appSecret)
    ) {
      res.status(HttpStatus.BAD_REQUEST).send();
      this.logger.error('Invalid WhatsApp webhook message');

      return null;
    }
    res.status(HttpStatus.OK).send();
    await this.messageQueueService.add<WhatsappParseWebhookMessageJobData>(
      WhatsappParseWebhookMessageJob.name,
      {
        dataType: 'history',
        data: body,
      },
    );
  }
}
