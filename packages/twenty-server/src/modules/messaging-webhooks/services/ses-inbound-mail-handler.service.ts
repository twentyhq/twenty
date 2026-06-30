import { Injectable, Logger } from '@nestjs/common';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { SesInboundUnsubscribeHandlerService } from 'src/modules/messaging-webhooks/services/ses-inbound-unsubscribe-handler.service';
import { type SesInboundNotification } from 'src/modules/messaging-webhooks/types/sns-message.type';
import { resolveInboundMailIntent } from 'src/modules/messaging-webhooks/utils/resolve-inbound-mail-intent.util';
import {
  MessagingInboundEmailImportJob,
  type MessagingInboundEmailImportJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-inbound-email-import.job';

@Injectable()
export class SesInboundMailHandlerService {
  private readonly logger = new Logger(SesInboundMailHandlerService.name);

  constructor(
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly sesInboundUnsubscribeHandlerService: SesInboundUnsubscribeHandlerService,
  ) {}

  async handle(
    notification: SesInboundNotification,
    snsMessageId: string,
  ): Promise<void> {
    switch (resolveInboundMailIntent(notification)) {
      case 'UNSUBSCRIBE':
        await this.sesInboundUnsubscribeHandlerService.handle(notification);

        return;
      case 'IMPORT':
        await this.enqueueInboundEmailImport(notification, snsMessageId);

        return;
    }
  }

  private async enqueueInboundEmailImport(
    notification: SesInboundNotification,
    snsMessageId: string,
  ): Promise<void> {
    const { receipt } = notification;

    if (receipt?.action?.type !== 'S3') {
      this.logger.warn(
        `SNS message ${snsMessageId} has unsupported action type ${receipt?.action?.type}`,
      );

      return;
    }

    await this.messageQueueService.add<MessagingInboundEmailImportJobData>(
      MessagingInboundEmailImportJob.name,
      {
        s3Key: receipt.action.objectKey,
        envelopeRecipients: receipt.recipients,
      },
      { id: snsMessageId },
    );
  }
}
