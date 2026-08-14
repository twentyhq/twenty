import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { UNSUBSCRIBE_MAILBOX_LOCAL_PART } from 'src/engine/core-modules/emailing-domain/constants/unsubscribe-mailbox.constant';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { InboundUnsubscribeHandlerService } from 'src/modules/messaging-webhooks/handlers/inbound-unsubscribe-handler.service';
import { type NormalizedInboundMailNotification } from 'src/modules/messaging-webhooks/types/normalized-inbound-mail-notification.type';
import {
  MessagingInboundEmailImportJob,
  type MessagingInboundEmailImportJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-inbound-email-import.job';

@Injectable()
export class InboundMailHandlerService {
  private readonly logger = new Logger(InboundMailHandlerService.name);

  constructor(
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly inboundUnsubscribeHandlerService: InboundUnsubscribeHandlerService,
  ) {}

  async handle(notification: NormalizedInboundMailNotification): Promise<void> {
    if (this.isAddressedToUnsubscribeMailbox(notification.recipients)) {
      await this.inboundUnsubscribeHandlerService.handle(notification.subject);

      return;
    }

    if (!isDefined(notification.message)) {
      this.logger.warn(
        `Inbound mail notification ${notification.dedupeKey} has no retrievable message content`,
      );

      return;
    }

    await this.messageQueueService.add<MessagingInboundEmailImportJobData>(
      MessagingInboundEmailImportJob.name,
      {
        s3Key: notification.message.reference,
        envelopeRecipients: notification.recipients,
      },
      { id: notification.dedupeKey },
    );
  }

  private isAddressedToUnsubscribeMailbox(recipients: string[]): boolean {
    return recipients.some(
      (recipient) =>
        recipient.split('@')[0]?.toLowerCase() ===
        UNSUBSCRIBE_MAILBOX_LOCAL_PART,
    );
  }
}
