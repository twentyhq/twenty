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
import { MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';
import { validateWebhookPayload } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/utils/validate-webhook-payload.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { IntegrationsEntity } from 'src/engine/metadata-modules/integrations/whatsapp/integrations.entity';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WhatsappWorkspaceEntity } from 'src/modules/integrations/whatsapp-workspace.entity';
import { WhatsappConvertMessage } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/services/whatsapp-convert-message';

@Injectable()
@Controller('whatsapp')
export class WhatsappController {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(IntegrationsEntity)
    private readonly integrationsRepository: Repository<IntegrationsEntity>,
    private readonly whatsappConvertMessage: WhatsappConvertMessage,
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
      whatsappToken: token,
    });

    if (whatsapp) {
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
  ): Promise<MessageWithParticipants[]> {
    res.status(HttpStatus.OK).send();
    // TODO: check if entry really contains only 1 business account number
    const whatsappBusinessAccountId = body.entry[0].id;
    const workspaceIdByWABAId = await this.integrationsRepository.findOneBy({
      whatsappBusinessAccountId: whatsappBusinessAccountId,
    });

    if (workspaceIdByWABAId === null || !workspaceIdByWABAId.workspace.id) {
      return [];
    }
    const workspaceId = workspaceIdByWABAId.workspace.id;
    const context = buildSystemAuthContext(workspaceId);

    const whatsappRecord =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        context,
        async () => {
          const whatsappRepository =
            await this.globalWorkspaceOrmManager.getRepository<WhatsappWorkspaceEntity>(
              workspaceId,
              'whatsapp',
            );

          return await whatsappRepository.findOneBy({
            businessAccountId: whatsappBusinessAccountId,
          });
        },
      );

    if (!whatsappRecord) {
      return [];
    }
    const appSecret = whatsappRecord.appSecret;

    if (
      !validateWebhookPayload(
        req.headers.get('X-Hub-Signature-256'),
        body.toString(),
        appSecret,
      )
    ) {
      return [];
    }
    let convertedMessages: MessageWithParticipants[] = [];

    for (const change of body.entry[0].changes) {
      if (change.value.errors === undefined) {
        for (const message of await this.whatsappConvertMessage.convertFromWhatsappMessageToMessageWithParticipants(
          change,
          whatsappBusinessAccountId,
          workspaceId,
        )) {
          convertedMessages.push(message);
        }
      }
    }

    return convertedMessages;
  }

  // TODO: how People records are created? Check MessagingSaveMessagesAndEnqueueContactCreationService
  // Logic would be to find an existing person with matching standard phone number or whatsapp number, if such doesn't exist, create new one
}
