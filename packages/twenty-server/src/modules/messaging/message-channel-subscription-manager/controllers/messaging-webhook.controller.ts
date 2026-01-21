import {
  Controller,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { Request, Response } from 'express';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { MessageChannelSubscriptionHealthService } from 'src/modules/messaging/message-channel-subscription-manager/services/message-channel-subscription-health.service';
import { MessageChannelSubscriptionMappingService } from 'src/modules/messaging/message-channel-subscription-manager/services/message-channel-subscription-mapping.service';
import {
  MessagingMessageListFetchJob,
  MessagingMessageListFetchJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-message-list-fetch.job';

type GmailPubSubNotification = {
  message: {
    data: string;
    messageId: string;
    publishTime: string;
  };
  subscription: string;
};

type GmailPubSubData = {
  emailAddress: string;
  historyId: number;
};

@Controller('webhooks/messaging')
export class MessagingWebhookController {
  private readonly logger = new Logger(MessagingWebhookController.name);

  constructor(
    private readonly mappingService: MessageChannelSubscriptionMappingService,
    private readonly healthService: MessageChannelSubscriptionHealthService,
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @Post('gmail')
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async handleGmailWebhook(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const notification = req.body as GmailPubSubNotification;

      if (!notification?.message?.data) {
        this.logger.warn('Received Gmail webhook with no message data');
        res.status(200).send('OK');

        return;
      }

      const dataBuffer = Buffer.from(notification.message.data, 'base64');
      const data: GmailPubSubData = JSON.parse(dataBuffer.toString('utf-8'));

      this.logger.debug(
        `Received Gmail webhook for ${data.emailAddress} (historyId: ${data.historyId})`,
      );

      this.healthService.recordMessageReceived();

      const mapping = await this.mappingService.getMapping(data.emailAddress);
      const entries = Object.entries(mapping);

      if (entries.length === 0) {
        this.logger.warn(
          `No mapping found for email ${data.emailAddress}, acknowledging webhook`,
        );
        res.status(200).send('OK');

        return;
      }

      await Promise.all(
        entries.map(([workspaceId, messageChannelId]) =>
          this.messageQueueService.add<MessagingMessageListFetchJobData>(
            MessagingMessageListFetchJob.name,
            { workspaceId, messageChannelId },
          ),
        ),
      );

      res.status(200).send('OK');
    } catch (error) {
      this.logger.error(`Error handling Gmail webhook: ${error.message}`);
      this.healthService.recordError(error);
      res.status(200).send('OK');
    }
  }
}
