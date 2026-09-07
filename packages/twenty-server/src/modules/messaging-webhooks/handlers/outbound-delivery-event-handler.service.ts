import { Injectable } from '@nestjs/common';

import { CAMPAIGN_SEND_RETRY_BACKOFF } from 'src/engine/core-modules/emailing-domain/constants/campaign-send-retry-backoff.constant';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { MessagingOutboundDeliveryEventJob } from 'src/modules/messaging-webhooks/jobs/messaging-outbound-delivery-event.job';
import { type NormalizedOutboundDeliveryEvent } from 'src/modules/messaging-webhooks/types/normalized-outbound-delivery-event.type';

const DELIVERY_EVENT_RETRY_LIMIT = 5;

@Injectable()
export class OutboundDeliveryEventHandlerService {
  constructor(
    @InjectMessageQueue(MessageQueue.campaignQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async handle(event: NormalizedOutboundDeliveryEvent): Promise<void> {
    await this.messageQueueService.add<NormalizedOutboundDeliveryEvent>(
      MessagingOutboundDeliveryEventJob.name,
      event,
      {
        id: event.dedupeKey,
        allowDuplicatedPrefixes: true,
        retryLimit: DELIVERY_EVENT_RETRY_LIMIT,
        backoff: CAMPAIGN_SEND_RETRY_BACKOFF,
      },
    );
  }
}
