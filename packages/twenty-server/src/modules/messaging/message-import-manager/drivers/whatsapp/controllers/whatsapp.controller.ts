import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Injectable,
  Logger,
  Post,
  Query,
  Req,
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

@Injectable()
@Controller('whatsapp')
export class WhatsappController {
  constructor(
    @InjectMessageQueue(MessageQueue.parseMessageQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly whatsappRetrieveSecret: WhatsappRetrieveAppSecretService,
    @InjectRepository(IntegrationsEntity)
    private readonly integrationsRepository: Repository<IntegrationsEntity>,
    private readonly logger = new Logger('WhatsappController'),
  ) {}

  // reference: https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/create-webhook-endpoint#get-requests
  // eslint-disable-next-line @nx/workspace-rest-api-methods-should-be-guarded
  @Get('/whatsapp_verification')
  public async whatsappVerification(
    @Query('hub.mode') mode: string,
    @Query('hub.challenge') challenge: string,
    @Query('hub.verify_token') token: string,
    @Res() res: Response,
  ) {
    if (mode !== 'subscribe') {
      res.status(HttpStatus.BAD_REQUEST).send();
      this.logger.error('WhatsApp webhook verification failed - wrong request');
    }

    const whatsapp = await this.integrationsRepository.findOneBy({
      whatsappWebhookToken: token,
    });

    if (whatsapp !== null) {
      // TODO: check the response (where challenge should be send? in body as is or in json, maybe in header?)
      res.status(HttpStatus.OK).send({ challenge: challenge });
    } else {
      res.status(HttpStatus.BAD_REQUEST).send();
      this.logger.error(
        'WhatsApp webhook verification failed - invalid stored token',
      );
    }
  }

  // TODO: add custom logic guard checking if request is from legitimate IP address (or maybe better to implement mTLS?)
  // eslint-disable-next-line @nx/workspace-rest-api-methods-should-be-guarded
  @Post('/message')
  public async getMessages(
    @Req() req: Request,
    @Body() body: WhatsAppWebhookMessage,
    @Res() res: Response,
  ) {
    res.status(HttpStatus.OK).send();
    const appSecret = await this.whatsappRetrieveSecret.retrieveAppSecret(
      body.entry[0].id,
    );

    if (
      appSecret === null ||
      !validateWebhookPayload(
        req.headers.get('X-Hub-Signature-256'),
        body.toString(),
        appSecret,
      )
    ) {
      throw new Error(); // TODO: fix
    }

    await this.messageQueueService.add<WhatsappParseWebhookMessageJobData>(
      WhatsappParseWebhookMessageJob.name,
      {
        dataType: 'message',
        data: body,
      },
    );
  }

  // eslint-disable-next-line @nx/workspace-rest-api-methods-should-be-guarded
  @Post('/history')
  public async getHistory(
    @Req() req: Request,
    @Body() body: WhatsappWebhookHistory,
    @Res() res: Response,
  ) {
    res.status(HttpStatus.OK).send();
    const appSecret = await this.whatsappRetrieveSecret.retrieveAppSecret(
      body.entry[0].id,
    );

    if (
      appSecret === null ||
      !validateWebhookPayload(
        req.headers.get('X-Hub-Signature-256'),
        body.toString(),
        appSecret,
      )
    ) {
      throw new Error(); // TODO: fix
    }
    await this.messageQueueService.add<WhatsappParseWebhookMessageJobData>(
      WhatsappParseWebhookMessageJob.name,
      {
        dataType: 'history',
        data: body,
      },
    );
  }

  // TODO: how People records are created? Check MessagingSaveMessagesAndEnqueueContactCreationService
  // Logic would be to find an existing person with matching standard phone number or whatsapp number, if such doesn't exist, create new one
}
